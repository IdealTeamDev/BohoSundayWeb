import type { BuyerInfo } from '@/types/checkout';
import { supabase } from './supabase';
import { getActiveEdition } from './editions';
import { sendAbandonedCartEmail } from './emailService';

export const ABANDONED_CART_DELAY_MS = 10 * 60 * 1000; // 10 minutes

// Only process orders created after this feature was deployed (or explicitly tracked)
const FEATURE_DEPLOYED_AT_MS = new Date('2026-11-27T13:15:00.000Z').getTime();

// In-memory timers and throttle state per server container
const activeTimers = new Map<string, NodeJS.Timeout>();
const inFlightEmails = new Set<string>();
let lastSweepAt = 0;

export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function buildDraftOrderId(ticketId: string, sessionToken: string): string {
  const cleanToken = (sessionToken || 'anon').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || 'anon';
  return `DRAFT-${ticketId.toUpperCase()}-${cleanToken}`;
}

function parseBuyerInfo(raw: any): BuyerInfo & Record<string, any> {
  if (!raw) return { name: '', phone: '', email: '' };
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return { name: '', phone: '', email: '' };
    }
  }
  return raw;
}

/**
 * Schedules an in-memory timer for 10 minutes from firstTrackedAt so that warm containers
 * fire the abandoned cart check right on time even without external traffic.
 */
export function scheduleAbandonedCartTimer(orderId: string, firstTrackedAtMs: number) {
  if (activeTimers.has(orderId)) {
    return;
  }

  const elapsed = Date.now() - firstTrackedAtMs;
  const delay = Math.max(1000, ABANDONED_CART_DELAY_MS - elapsed);

  const timer = setTimeout(async () => {
    activeTimers.delete(orderId);
    try {
      await triggerAbandonedCartForOrder({
        orderId,
        reason: 'timeout_10m',
      });
    } catch (err) {
      console.error(`[AbandonedCart] Error in scheduled timer for ${orderId}:`, err);
    }
  }, delay);

  if (typeof (timer as any).unref === 'function') {
    (timer as any).unref();
  }

  activeTimers.set(orderId, timer);
}

export function clearAbandonedCartTimer(orderId: string) {
  const timer = activeTimers.get(orderId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(orderId);
  }
}

/**
 * Tracks a buyer's email as soon as they enter it in the checkout form.
 * Creates or updates a draft pending order in Supabase without resetting the 10-minute timer.
 */
export async function trackCheckoutProgress({
  ticketId,
  sessionToken,
  buyerInfo,
  quantity = 1,
  paymentMethod = 'wompi',
}: {
  ticketId: string;
  sessionToken: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
  paymentMethod?: 'mercadopago' | 'wompi';
}): Promise<{ tracked: boolean; orderId?: string }> {
  // Also trigger a non-blocking sweep of expired carts
  processAbandonedCarts().catch(() => {});

  if (!ticketId || !isValidEmail(buyerInfo?.email)) {
    return { tracked: false };
  }

  const cleanEmail = buyerInfo.email.trim();
  const draftOrderId = buildDraftOrderId(ticketId, sessionToken);

  try {
    // Check if there is already an order (draft or real ORD-...) for this sessionToken & ticketId
    let existingRow: any = null;

    if (sessionToken) {
      const { data: sessionRows } = await supabase
        .from('orders')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('session_token', sessionToken)
        .order('created_at', { ascending: false })
        .limit(5);

      if (sessionRows && sessionRows.length > 0) {
        // If any order in this session is already approved, don't track abandoned cart
        if (sessionRows.some((r: any) => r.status === 'approved')) {
          return { tracked: false };
        }
        // Prefer real ORD-... over DRAFT-...
        existingRow =
          sessionRows.find((r: any) => !String(r.order_id).startsWith('DRAFT-')) ||
          sessionRows[0];
      }
    }

    if (!existingRow) {
      const { data: byId } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', draftOrderId)
        .maybeSingle();
      existingRow = byId;
    }

    const existingInfo: Record<string, any> = existingRow ? parseBuyerInfo(existingRow.buyer_info) : {};
    if (existingRow?.status === 'approved' || existingInfo.abandonedEmailSent) {
      return { tracked: false, orderId: existingRow.order_id };
    }

    const targetOrderId = existingRow ? existingRow.order_id : draftOrderId;
    const firstTrackedAt =
      Number(existingInfo.firstTrackedAt) ||
      (existingRow?.created_at ? new Date(existingRow.created_at).getTime() : Date.now());
    const createdAtIso = existingRow?.created_at || new Date(firstTrackedAt).toISOString();

    const activeEdition = await getActiveEdition();

    const updatedBuyerInfo = {
      ...existingInfo,
      ...buyerInfo,
      email: cleanEmail,
      trackAbandonedCart: true,
      firstTrackedAt,
      abandonedEmailSent: Boolean(existingInfo.abandonedEmailSent),
    };

    const { error } = await supabase.from('orders').upsert({
      order_id: targetOrderId,
      ticket_id: ticketId,
      session_token: sessionToken || '',
      buyer_info: updatedBuyerInfo,
      quantity: Number(quantity) || 1,
      payment_method: paymentMethod || 'wompi',
      status: existingRow?.status || 'pending',
      accesses_used: 0,
      edition_slug: activeEdition.slug,
      edition_name: activeEdition.name,
      created_at: createdAtIso,
    });

    if (error) {
      console.warn('[AbandonedCart] Primary upsert failed, retrying base schema:', error.message);
      await supabase.from('orders').upsert({
        order_id: targetOrderId,
        ticket_id: ticketId,
        session_token: sessionToken || '',
        buyer_info: updatedBuyerInfo,
        quantity: Number(quantity) || 1,
        payment_method: paymentMethod || 'wompi',
        status: existingRow?.status || 'pending',
        accesses_used: 0,
        created_at: createdAtIso,
      });
    }

    scheduleAbandonedCartTimer(targetOrderId, firstTrackedAt);
    return { tracked: true, orderId: targetOrderId };
  } catch (err) {
    console.error('[AbandonedCart] Error tracking checkout progress:', err);
    return { tracked: false };
  }
}

/**
 * Triggers the abandoned cart / payment failure recovery email for a specific order or checkout session,
 * ensuring idempotency so the buyer never receives duplicate recovery emails or an email after a successful purchase.
 */
export async function triggerAbandonedCartForOrder({
  orderId,
  sessionToken,
  ticketId,
  buyerInfo,
  reason,
}: {
  orderId?: string;
  sessionToken?: string;
  ticketId?: string;
  buyerInfo?: BuyerInfo;
  reason: 'payment_failed' | 'timeout_10m';
}): Promise<boolean> {
  try {
    let targetRow: any = null;

    if (orderId) {
      clearAbandonedCartTimer(orderId);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      targetRow = data;
    }

    if (!targetRow && sessionToken && ticketId) {
      const { data: rows } = await supabase
        .from('orders')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('session_token', sessionToken)
        .order('created_at', { ascending: false })
        .limit(1);
      targetRow = rows?.[0] || null;
    }

    const rowBuyerInfo: Record<string, any> = targetRow ? parseBuyerInfo(targetRow.buyer_info) : {};
    const mergedBuyerInfo: Record<string, any> = {
      name: '',
      phone: '',
      email: '',
      ...rowBuyerInfo,
      ...(buyerInfo || {}),
    };

    const email = (mergedBuyerInfo.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return false;
    }

    if (targetRow?.status === 'approved' || rowBuyerInfo.abandonedEmailSent) {
      return false;
    }

    // If this is a 10-minute timeout on a real order (ORD-...), first reconcile directly with Wompi
    // so that if the user paid in Wompi and the webhook was delayed/lost, we auto-approve & send their QR instead!
    if (
      reason === 'timeout_10m' &&
      targetRow?.order_id &&
      !String(targetRow.order_id).startsWith('DRAFT-') &&
      targetRow.status === 'pending'
    ) {
      try {
        const { verifyOrderWithWompi } = await import('./wompiReconciliation');
        const reconcileRes = await verifyOrderWithWompi(targetRow.order_id);
        if (reconcileRes.newStatus === 'approved') {
          console.log(
            `[AbandonedCart] 🎉 Order ${targetRow.order_id} was APPROVED in Wompi! Sent QR confirmation instead of abandoned cart email.`
          );
          return false;
        }
      } catch (reconcileErr) {
        console.warn('[AbandonedCart] Could not pre-verify order with Wompi:', reconcileErr);
      }
    }

    if (inFlightEmails.has(email)) {
      return false;
    }
    inFlightEmails.add(email);

    try {
      // Check recent orders (last 2 hours) to ensure this email hasn't already bought or been notified
      const twoHoursAgoIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', twoHoursAgoIso)
        .order('created_at', { ascending: false });

      const matchingOrders = (recentOrders || []).filter((row: any) => {
        const info = parseBuyerInfo(row.buyer_info);
        return (info.email || '').trim().toLowerCase() === email;
      });

      // 1. If the user already has an approved order recently, do NOT send abandoned cart email
      if (matchingOrders.some((row: any) => row.status === 'approved')) {
        console.log(`[AbandonedCart] ℹ️ Skipping recovery email for ${email}: user has an approved order.`);
        return false;
      }

      // 2. If we already sent a recovery email to this user within the last 30 minutes, skip duplicate
      const thirtyMinsAgoMs = Date.now() - 30 * 60 * 1000;
      const alreadyNotifiedRecently = matchingOrders.some((row: any) => {
        const info = parseBuyerInfo(row.buyer_info);
        if (!info.abandonedEmailSent) return false;
        const sentAtMs = info.abandonedEmailSentAt ? new Date(info.abandonedEmailSentAt).getTime() : Date.now();
        return sentAtMs >= thirtyMinsAgoMs;
      });

      if (alreadyNotifiedRecently) {
        console.log(`[AbandonedCart] ℹ️ Skipping duplicate recovery email for ${email} (already sent within 30m).`);
        return false;
      }

      const sentAtIso = new Date().toISOString();

      // Mark target order and all matching pending orders for this email as notified BEFORE sending
      const ordersToUpdate = matchingOrders.length > 0 ? matchingOrders : (targetRow ? [targetRow] : []);
      for (const row of ordersToUpdate) {
        clearAbandonedCartTimer(row.order_id);
        const info = parseBuyerInfo(row.buyer_info);
        const updatedInfo = {
          ...info,
          abandonedEmailSent: true,
          abandonedEmailSentAt: sentAtIso,
          abandonedReason: reason,
        };

        const isDraft = String(row.order_id).startsWith('DRAFT-');
        const nextStatus =
          row.status === 'pending' && (isDraft || reason === 'timeout_10m')
            ? 'rejected'
            : row.status;
        const nextErrorDetail =
          row.error_detail ||
          (reason === 'timeout_10m' ? 'Carrito abandonado (10 minutos sin finalizar compra)' : 'Fallo en el proceso de compra');

        await supabase
          .from('orders')
          .update({
            buyer_info: updatedInfo,
            status: nextStatus,
            error_detail: nextErrorDetail,
          })
          .eq('order_id', row.order_id);
      }

      // If no row existed in DB yet (e.g., direct expire beacon before DB upsert finished), insert a record for audit/dedup
      if (ordersToUpdate.length === 0 && ticketId) {
        const activeEdition = await getActiveEdition();
        const fallbackOrderId = orderId || buildDraftOrderId(ticketId, sessionToken || `${Date.now()}`);
        await supabase.from('orders').upsert({
          order_id: fallbackOrderId,
          ticket_id: ticketId,
          session_token: sessionToken || '',
          buyer_info: {
            ...mergedBuyerInfo,
            email,
            trackAbandonedCart: true,
            abandonedEmailSent: true,
            abandonedEmailSentAt: sentAtIso,
            abandonedReason: reason,
          },
          quantity: 1,
          payment_method: 'wompi',
          status: 'rejected',
          error_detail: reason === 'timeout_10m' ? 'Carrito abandonado (10 minutos)' : 'Fallo en compra',
          accesses_used: 0,
          edition_slug: activeEdition.slug,
          edition_name: activeEdition.name,
          created_at: sentAtIso,
        });
      }

      // Send the recovery email
      await sendAbandonedCartEmail({
        email,
        locale: mergedBuyerInfo.locale,
      });

      console.log(`[AbandonedCart] ✅ Sent abandoned cart email to ${email} (Reason: ${reason})`);
      return true;
    } finally {
      inFlightEmails.delete(email);
    }
  } catch (err) {
    console.error('[AbandonedCart] 🚨 Error in triggerAbandonedCartForOrder:', err);
    return false;
  }
}

/**
 * Scans Supabase for pending orders/carts older than 10 minutes that haven't completed purchase
 * and sends them the abandoned cart recovery email.
 */
export async function processAbandonedCarts(force = false): Promise<{
  processedCount: number;
  sentEmails: string[];
}> {
  const now = Date.now();
  if (!force && now - lastSweepAt < 30 * 1000) {
    return { processedCount: 0, sentEmails: [] };
  }
  lastSweepAt = now;

  const sentEmails: string[] = [];

  try {
    const tenMinsAgoIso = new Date(now - ABANDONED_CART_DELAY_MS).toISOString();
    const minCreatedAtIso = new Date(
      Math.max(FEATURE_DEPLOYED_AT_MS, now - 24 * 60 * 60 * 1000)
    ).toISOString();

    const { data: pendingRows, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .lte('created_at', tenMinsAgoIso)
      .gte('created_at', minCreatedAtIso)
      .order('created_at', { ascending: true });

    if (error || !pendingRows || pendingRows.length === 0) {
      return { processedCount: 0, sentEmails: [] };
    }

    for (const row of pendingRows) {
      const info = parseBuyerInfo(row.buyer_info);
      if (!info || info.abandonedEmailSent || !isValidEmail(info.email)) {
        continue;
      }

      // Check if 10 minutes have passed since firstTrackedAt (if present) or created_at
      const trackedAtMs = Number(info.firstTrackedAt) || new Date(row.created_at).getTime();
      if (now - trackedAtMs < ABANDONED_CART_DELAY_MS) {
        continue;
      }

      const sent = await triggerAbandonedCartForOrder({
        orderId: row.order_id,
        sessionToken: row.session_token,
        ticketId: row.ticket_id,
        buyerInfo: info,
        reason: 'timeout_10m',
      });

      if (sent) {
        sentEmails.push(info.email.trim().toLowerCase());
      }
    }

    return {
      processedCount: sentEmails.length,
      sentEmails,
    };
  } catch (err) {
    console.error('[AbandonedCart] Error in processAbandonedCarts sweep:', err);
    return { processedCount: 0, sentEmails: [] };
  }
}
