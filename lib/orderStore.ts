import type { BuyerInfo } from '@/types/checkout';
import { decreaseDatabaseStock } from './tickets';
import { sendAdminNotificationEmail } from './emailService';
import { getDynamicTickets } from './tickets';
import { supabase } from './supabase';
import { getActiveEdition } from './editions';
import {
  buildDraftOrderId,
  clearAbandonedCartTimer,
  scheduleAbandonedCartTimer,
  triggerAbandonedCartForOrder,
} from './abandonedCart';
import crypto from 'crypto';

export interface OrderDetail {
  orderId: string;
  ticketId: string;
  sessionToken: string;
  buyerInfo: BuyerInfo;
  quantity: number;
  paymentMethod: 'mercadopago' | 'wompi';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  paymentId?: string;
  errorDetail?: string;
  accessesUsed?: number;
  stageId?: string;
  editionSlug?: string;
  editionName?: string;
}

/**
 * Converts a Supabase database row to an OrderDetail object
 */
function dbRowToOrderDetail(row: any): OrderDetail {
  return {
    orderId: row.order_id,
    ticketId: row.ticket_id,
    sessionToken: row.session_token || '',
    buyerInfo: typeof row.buyer_info === 'string' ? JSON.parse(row.buyer_info) : (row.buyer_info || {}),
    quantity: Number(row.quantity) || 1,
    paymentMethod: row.payment_method as 'mercadopago' | 'wompi',
    status: row.status as 'pending' | 'approved' | 'rejected',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    paymentId: row.payment_id || undefined,
    errorDetail: row.error_detail || undefined,
    accessesUsed: Number(row.accesses_used) || 0,
    stageId: row.stage_id || undefined,
    editionSlug: row.edition_slug || 'colombiamoda',
    editionName: row.edition_name || 'Colombiamoda',
  };
}

/**
 * Creates and registers a new pending order in Supabase database
 */
export async function createOrder(
  orderId: string,
  ticketId: string,
  sessionToken: string,
  buyerInfo: BuyerInfo,
  quantity: number,
  paymentMethod: 'mercadopago' | 'wompi',
  stageId?: string
): Promise<OrderDetail> {
  const createdAt = Date.now();
  const activeEdition = await getActiveEdition();

  let firstTrackedAt = createdAt;
  const draftOrderId = sessionToken ? buildDraftOrderId(ticketId, sessionToken) : '';

  if (draftOrderId) {
    try {
      clearAbandonedCartTimer(draftOrderId);
      const { data: draftRow } = await supabase
        .from('orders')
        .select('buyer_info, created_at')
        .eq('order_id', draftOrderId)
        .maybeSingle();

      if (draftRow) {
        const draftInfo =
          typeof draftRow.buyer_info === 'string'
            ? JSON.parse(draftRow.buyer_info)
            : draftRow.buyer_info || {};
        firstTrackedAt =
          Number(draftInfo.firstTrackedAt) ||
          (draftRow.created_at ? new Date(draftRow.created_at).getTime() : createdAt);
        await supabase.from('orders').delete().eq('order_id', draftOrderId);
      }
    } catch (e) {
      console.warn('[OrderStore] Could not migrate draft order:', e);
    }
  }

  const enrichedBuyerInfo: BuyerInfo & Record<string, any> = {
    ...buyerInfo,
    trackAbandonedCart: true,
    firstTrackedAt,
    abandonedEmailSent: false,
  };

  const order: OrderDetail = {
    orderId,
    ticketId,
    sessionToken,
    buyerInfo: enrichedBuyerInfo,
    quantity,
    paymentMethod,
    status: 'pending',
    createdAt,
    accessesUsed: 0,
    stageId,
    editionSlug: activeEdition.slug,
    editionName: activeEdition.name,
  };
  
  try {
    const { error } = await supabase.from('orders').upsert({
      order_id: orderId,
      ticket_id: ticketId,
      session_token: sessionToken,
      buyer_info: enrichedBuyerInfo,
      quantity,
      payment_method: paymentMethod,
      status: 'pending',
      accesses_used: 0,
      stage_id: stageId || null,
      edition_slug: activeEdition.slug,
      edition_name: activeEdition.name,
      created_at: new Date(createdAt).toISOString(),
    });

    if (error) {
      console.warn('[OrderStore] ⚠️ Primary upsert into orders failed, retrying with base schema:', error.message);
      const { error: fallbackErr } = await supabase.from('orders').upsert({
        order_id: orderId,
        ticket_id: ticketId,
        session_token: sessionToken,
        buyer_info: enrichedBuyerInfo,
        quantity,
        payment_method: paymentMethod,
        status: 'pending',
        accesses_used: 0,
        stage_id: stageId || null,
        created_at: new Date(createdAt).toISOString(),
      });
      if (fallbackErr) {
        console.error('[OrderStore] ❌ Error inserting order into Supabase (fallback):', fallbackErr);
      }
    } else {
      console.log(`[OrderStore] 📝 Order created in Supabase: ${orderId} (Ticket: ${ticketId}, Edition: ${activeEdition.name}, Status: pending)`);
    }

    if (!orderId.startsWith('ORD-QUICK-')) {
      scheduleAbandonedCartTimer(orderId, firstTrackedAt);
    }
  } catch (err) {
    console.error('[OrderStore] 🚨 Exception inserting order into Supabase:', err);
  }

  return order;
}

/**
 * Retrieves an order by its ID from Supabase
 */
export async function getOrder(orderId: string): Promise<OrderDetail | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) {
      console.error(`[OrderStore] ❌ Error fetching order ${orderId} from Supabase:`, error);
      return null;
    }

    if (data) {
      return dbRowToOrderDetail(data);
    }
  } catch (err) {
    console.error(`[OrderStore] 🚨 Exception fetching order ${orderId} from Supabase:`, err);
  }

  return null;
}

/**
 * Retrieves all orders from Supabase
 */
export async function getAllOrders(): Promise<OrderDetail[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[OrderStore] ❌ Error fetching all orders from Supabase:', error);
      return [];
    }

    if (data) {
      return data.map(dbRowToOrderDetail);
    }
  } catch (err) {
    console.error('[OrderStore] 🚨 Exception fetching all orders from Supabase:', err);
  }

  return [];
}

/**
 * Approves a pending order in Supabase
 */
export async function approveOrder(
  orderId: string,
  paymentId: string,
  fallbackOrder?: OrderDetail
): Promise<OrderDetail | null> {
  const order = (await getOrder(orderId)) || fallbackOrder || null;
  if (!order) {
    console.error(`[OrderStore] ❌ Error: Order ${orderId} not found to approve.`);
    return null;
  }
  
  if (order.status === 'approved') {
    console.log(`[OrderStore] ℹ️ Order ${orderId} is already approved.`);
    return order;
  }

  clearAbandonedCartTimer(orderId);
  if (order.sessionToken) {
    const draftOrderId = buildDraftOrderId(order.ticketId, order.sessionToken);
    clearAbandonedCartTimer(draftOrderId);
    supabase.from('orders').delete().eq('order_id', draftOrderId).then(() => {});
  }

  const updatedOrder: OrderDetail = {
    ...order,
    status: 'approved',
    paymentId,
  };
  
  try {
    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        payment_id: paymentId,
      })
      .eq('order_id', orderId);

    if (updateOrderErr) {
      console.error(`[OrderStore] ❌ Error updating order status to approved in Supabase:`, updateOrderErr);
    } else {
      console.log(`[OrderStore] ✅ Order ${orderId} status updated to approved in Supabase orders table.`);
    }
  } catch (err) {
    console.error(`[OrderStore] 🚨 Exception updating order ${orderId} in Supabase:`, err);
  }

  // Save buyer/ticket details to Supabase database (purchased_tickets table)
  try {
    const tickets = await getDynamicTickets(order.stageId, true, true);
    const ticket = tickets.find((t) => t.id === order.ticketId || t.id.toLowerCase() === order.ticketId.toLowerCase());

    const isGuest = order.ticketId === 'invitado_anytime' || order.ticketId === 'invitado-anytime';
    const ticketName = ticket?.name || (isGuest ? 'Invitado Anytime' : 'Boleto/Cama');
    const ticketNumber = ticket?.number || 0;
    const zone = ticket?.zone || 'general';

    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalAccesos = basePersons * order.quantity;

    const checksum = crypto
      .createHash('sha256')
      .update(`${order.orderId}-${order.buyerInfo.email}-${paymentId || ''}-approved`)
      .digest('hex')
      .substring(0, 16);

    const languageStr = (order.buyerInfo.locale || 'es').toUpperCase() === 'EN' ? 'EN' : 'ES';
    const ticketPrice = isGuest ? 0 : (ticket?.price || 0);
    const activeEdition = order.editionSlug ? { slug: order.editionSlug, name: order.editionName || 'Colombiamoda' } : await getActiveEdition();

    const baseTicketRow = {
      order_id: order.orderId,
      ticket_id: order.ticketId,
      ticket_name: ticketName,
      ticket_number: ticketNumber,
      zone: zone,
      buyer_name: order.buyerInfo.name,
      buyer_email: order.buyerInfo.email,
      buyer_phone: order.buyerInfo.phone,
      total_accesos: totalAccesos,
      accesos_restantes: totalAccesos,
      status: 'paid',
      checksum: checksum,
      payment_ref: paymentId,
      created_at: new Date(order.createdAt).toISOString(),
      language: languageStr,
      ticket_price: ticketPrice,
    };

    const { error } = await supabase.from('purchased_tickets').insert([{
      ...baseTicketRow,
      edition_slug: activeEdition.slug,
      edition_name: activeEdition.name
    }]);

    if (error) {
      console.warn('[OrderStore] ⚠️ Primary insert into purchased_tickets failed, retrying without edition columns:', error.message);
      const { error: fallbackInsertErr } = await supabase.from('purchased_tickets').insert([baseTicketRow]);
      if (fallbackInsertErr) {
        console.error('[OrderStore] ❌ Error inserting approved ticket into purchased_tickets in Supabase:', fallbackInsertErr);
      } else {
        console.log(`[OrderStore] 🎉 Saved approved ticket (fallback schema) to purchased_tickets for Order ${order.orderId}`);
      }
    } else {
      console.log(`[OrderStore] 🎉 Successfully saved approved ticket to purchased_tickets table for Order ${order.orderId}`);
    }
  } catch (dbErr) {
    console.error('[OrderStore] 🚨 Exception saving to purchased_tickets in Supabase:', dbErr);
  }

  // Decrease stock/mark unavailable in database
  await decreaseDatabaseStock(order.ticketId).catch((err) => {
    console.error('[OrderStore] Error calling decreaseDatabaseStock:', err);
  });

  // Send success notification email to admin asynchronously
  sendAdminNotificationEmail(updatedOrder, 'approved').catch((err) => {
    console.error('[OrderStore] Error calling sendAdminNotificationEmail (approved):', err);
  });

  return updatedOrder;
}

/**
 * Marks an order as rejected/failed in Supabase
 */
export async function rejectOrder(orderId: string, errorDetail?: string): Promise<OrderDetail | null> {
  clearAbandonedCartTimer(orderId);
  const order = await getOrder(orderId);
  if (!order) {
    console.error(`[OrderStore] ❌ Error: Order ${orderId} not found to reject.`);
    return null;
  }

  const updatedOrder: OrderDetail = {
    ...order,
    status: 'rejected',
    errorDetail,
  };
  
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        error_detail: errorDetail || null,
      })
      .eq('order_id', orderId);

    if (error) {
      console.error(`[OrderStore] ❌ Error updating order status to rejected in Supabase:`, error);
    } else {
      console.log(`[OrderStore] ❌ Order ${orderId} marked as rejected in Supabase. Reason: ${errorDetail}`);
    }
  } catch (err) {
    console.error(`[OrderStore] 🚨 Exception marking order ${orderId} as rejected in Supabase:`, err);
  }

  // Send failed notification email to admin and abandoned cart / recovery email to buyer asynchronously
  if (order.status !== 'rejected' && order.status !== 'approved') {
    sendAdminNotificationEmail(updatedOrder, 'rejected').catch((err) => {
      console.error('[OrderStore] Error calling sendAdminNotificationEmail (rejected):', err);
    });

    triggerAbandonedCartForOrder({
      orderId,
      sessionToken: updatedOrder.sessionToken,
      ticketId: updatedOrder.ticketId,
      buyerInfo: updatedOrder.buyerInfo,
      reason: 'payment_failed',
    }).catch((err) => {
      console.error('[OrderStore] Error triggering abandoned cart recovery email on rejectOrder:', err);
    });
  }

  return updatedOrder;
}

/**
 * Records accesses check-in for an order in Supabase
 */
export async function updateOrderAccesses(orderId: string, count: number, totalCapacity: number): Promise<{ success: boolean; error?: string; remaining?: number }> {
  const order = await getOrder(orderId);
  
  if (!order) {
    return { success: false, error: 'Orden no encontrada' };
  }

  if (order.status !== 'approved') {
    return { success: false, error: 'La orden no está en estado aprobado/pagado' };
  }

  const currentUsed = order.accessesUsed || 0;
  const newUsed = currentUsed + count;

  if (newUsed > totalCapacity) {
    return { 
      success: false, 
      error: `Límite de accesos excedido. Capacidad: ${totalCapacity}, Usados: ${currentUsed}, Solicitados: ${count}`,
      remaining: Math.max(0, totalCapacity - currentUsed)
    };
  }

  try {
    await supabase
      .from('orders')
      .update({ accesses_used: newUsed })
      .eq('order_id', orderId);
  } catch (err) {
    console.error(`[OrderStore] Error updating accesses_used in Supabase for ${orderId}:`, err);
  }

  console.log(`[OrderStore] 🎟️ Access validation: order ${orderId} used ${count} more access(es). Total used: ${newUsed}/${totalCapacity}`);
  
  return { 
    success: true, 
    remaining: totalCapacity - newUsed 
  };
}

