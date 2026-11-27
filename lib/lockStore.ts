import type { TicketLock } from '@/types/checkout';
import type { Ticket } from '@/types';
import { supabase } from './supabase';
import { getActiveEdition } from './editions';
import { processAbandonedCarts } from './abandonedCart';
import { syncAllPendingOrders } from './wompiReconciliation';

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes initial checkout lock
const PAYMENT_GATEWAY_LOCK_MS = 15 * 60 * 1000; // 15 minutes when redirected to Wompi / PSE / payment gateway

/**
 * Remove all expired locks from Supabase database, reconcile pending Wompi orders, and process expired 10-minute abandoned carts
 */
async function cleanExpiredLocks(): Promise<void> {
  syncAllPendingOrders().catch((err) => {
    console.error('[LockStore] Error reconciling pending Wompi orders:', err);
  });

  processAbandonedCarts().catch((err) => {
    console.error('[LockStore] Error sweeping abandoned carts:', err);
  });

  try {
    const { error } = await supabase
      .from('ticket_locks')
      .delete()
      .eq('status', 'locked')
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('[LockStore] Error cleaning expired locks:', error);
    }
  } catch (err) {
    console.error('[LockStore] Exception cleaning expired locks:', err);
  }
}

/**
 * Helper to check if a table/bed is already paid/approved in the active edition
 */
async function isTableSoldInEdition(ticketId: string, editionSlug: string): Promise<boolean> {
  const [{ data: purchases, error: purchaseError }, { data: approvedOrders, error: orderError }] =
    await Promise.all([
      supabase
        .from('purchased_tickets')
        .select('order_id')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .eq('edition_slug', editionSlug)
        .limit(1),
      supabase
        .from('orders')
        .select('order_id')
        .eq('ticket_id', ticketId)
        .eq('status', 'approved')
        .eq('edition_slug', editionSlug)
        .limit(1),
    ]);

  if (purchaseError) throw purchaseError;
  if (orderError) {
    // Fallback if edition_slug column query fails on orders
    console.warn('[LockStore] Warning checking orders edition_slug:', orderError.message);
  }

  return Boolean(
    (purchases && purchases.length > 0) ||
    (approvedOrders && approvedOrders.length > 0)
  );
}

/**
 * Try to lock a ticket for a session in the Supabase database.
 * Returns the lock if successful, null if already locked or no stock.
 */
export async function acquireLock(
  ticketId: string,
  sessionToken: string,
  quantity: number = 1,
  ticketsList?: Ticket[]
): Promise<TicketLock | null> {
  await cleanExpiredLocks();

  if (!ticketId || !sessionToken || quantity <= 0) {
    return null;
  }

  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);

  if (!ticket) {
    return null;
  }

  const lockKey = ticket.stock !== undefined ? `${ticketId}_${sessionToken}` : ticketId;
  const activeEdition = await getActiveEdition();

  // If the ticket has stock defined (individual tickets early/anytime/general)
  if (ticket.stock !== undefined) {
    try {
      const nowIso = new Date().toISOString();

      // 1. Get total sold count from purchased_tickets for current active edition
      const { data: soldData, error: soldError } = await supabase
        .from('purchased_tickets')
        .select('total_accesos')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .eq('edition_slug', activeEdition.slug);

      if (soldError) throw soldError;
      const soldCount = (soldData || []).reduce((sum, row) => sum + Number(row.total_accesos), 0);

      // 2. Get active locks count from ticket_locks (excluding our own sessionToken)
      const { data: lockedData, error: lockedError } = await supabase
        .from('ticket_locks')
        .select('quantity')
        .eq('ticket_id', ticketId)
        .eq('status', 'locked')
        .gt('expires_at', nowIso)
        .neq('session_token', sessionToken);

      if (lockedError) throw lockedError;
      const lockedCount = (lockedData || []).reduce((sum, row) => sum + Number(row.quantity), 0);

      // 3. Get total stock from boleteria_individual table
      const { data: dbTicket, error: dbError } = await supabase
        .from('boleteria_individual')
        .select('stock')
        .eq('id', ticketId)
        .maybeSingle();

      if (dbError) throw dbError;
      const totalStock = dbTicket ? Number(dbTicket.stock) : (ticket.stock || 100);

      // Check if requested quantity exceeds available stock
      if (soldCount + lockedCount + quantity > totalStock) {
        console.warn(`[LockStore] ❌ Insufficient stock for ${ticketId}. Sold: ${soldCount}, Locked: ${lockedCount}, Requested: ${quantity}, Total Stock: ${totalStock}`);
        return null;
      }

      // 4. Create/update the lock in Supabase
      const expiresAtMs = Date.now() + LOCK_DURATION_MS;
      const expiresAt = new Date(expiresAtMs).toISOString();
      const { error: insertError } = await supabase
        .from('ticket_locks')
        .upsert({
          lock_key: lockKey,
          ticket_id: ticketId,
          session_token: sessionToken,
          quantity,
          status: 'locked',
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error('[LockStore] Error saving lock to DB:', insertError);
        return null;
      }

      // 5. Post-write concurrency check: re-verify total locked + sold after inserting our lock
      // to prevent race conditions when two users grab the last remaining tickets at the exact same millisecond.
      const { data: postLocks, error: postLockErr } = await supabase
        .from('ticket_locks')
        .select('session_token, quantity')
        .eq('ticket_id', ticketId)
        .eq('status', 'locked')
        .gt('expires_at', new Date().toISOString());

      if (!postLockErr && postLocks) {
        const totalLockedAfter = postLocks.reduce((sum, row) => sum + Number(row.quantity), 0);
        if (soldCount + totalLockedAfter > totalStock) {
          console.warn(`[LockStore] ⚠️ Race condition detected on last stock for ${ticketId}. Rolling back lock for ${sessionToken}.`);
          await supabase
            .from('ticket_locks')
            .delete()
            .eq('lock_key', lockKey)
            .eq('session_token', sessionToken);
          return null;
        }
      }

      return {
        ticketId,
        sessionToken,
        expiresAt: expiresAtMs,
        status: 'locked',
        quantity,
      };
    } catch (err) {
      console.error('[LockStore] Error in acquireLock:', err);
      return null;
    }
  } else {
    // Table/Cama ticket logic (Atomic anti-race-condition implementation)
    try {
      // 1. Verify not already sold in purchased_tickets or approved orders for active edition
      const alreadySold = await isTableSoldInEdition(ticketId, activeEdition.slug);
      if (alreadySold) {
        console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already sold in ${activeEdition.name}`);
        return null;
      }

      const nowIso = new Date().toISOString();

      // 2. Delete any expired lock for this table specifically
      await supabase
        .from('ticket_locks')
        .delete()
        .eq('lock_key', lockKey)
        .eq('status', 'locked')
        .lt('expires_at', nowIso);

      // 3. Check if any lock currently exists for this table
      const { data: existingLocks, error: lockError } = await supabase
        .from('ticket_locks')
        .select('*')
        .eq('lock_key', lockKey)
        .limit(1);

      if (lockError) throw lockError;
      const existingLock = existingLocks && existingLocks.length > 0 ? existingLocks[0] : null;

      const expiresAtMs = Date.now() + LOCK_DURATION_MS;
      const expiresAt = new Date(expiresAtMs).toISOString();

      if (existingLock) {
        if (existingLock.status === 'sold') {
          console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already sold (in ticket_locks)`);
          return null;
        }

        const isStillActive = new Date(existingLock.expires_at).getTime() >= Date.now();
        if (existingLock.session_token !== sessionToken && isStillActive) {
          console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already locked by session ${existingLock.session_token}`);
          return null;
        }

        // Same session renewing lock, or expired lock that wasn't deleted yet
        const { error: updateErr } = await supabase
          .from('ticket_locks')
          .update({
            session_token: sessionToken,
            quantity: 1,
            status: 'locked',
            expires_at: expiresAt,
          })
          .eq('lock_key', lockKey)
          .eq('session_token', existingLock.session_token);

        if (updateErr) {
          console.error('[LockStore] Error updating table lock:', updateErr);
          return null;
        }
      } else {
        // 4. Use INSERT (not UPSERT) so Postgres primary key constraint rejects concurrent writers!
        const { error: insertError } = await supabase
          .from('ticket_locks')
          .insert({
            lock_key: lockKey,
            ticket_id: ticketId,
            session_token: sessionToken,
            quantity: 1,
            status: 'locked',
            expires_at: expiresAt,
          });

        if (insertError) {
          console.warn(`[LockStore] ❌ Concurrent lock prevented on table ${ticketId}:`, insertError.message);
          return null;
        }
      }

      // 5. Post-write ownership verification: confirm our sessionToken is the one persisted in DB
      const { data: verifyRows, error: verifyErr } = await supabase
        .from('ticket_locks')
        .select('session_token, status, expires_at')
        .eq('lock_key', lockKey)
        .limit(1);

      if (verifyErr || !verifyRows || verifyRows.length === 0) {
        return null;
      }

      const persisted = verifyRows[0];
      if (persisted.session_token !== sessionToken || persisted.status !== 'locked') {
        console.warn(`[LockStore] ❌ Post-write lock verification failed for ${ticketId}. Owned by another session.`);
        return null;
      }

      return {
        ticketId,
        sessionToken,
        expiresAt: expiresAtMs,
        status: 'locked',
        quantity: 1,
      };
    } catch (err) {
      console.error('[LockStore] Error in acquireLock table:', err);
      return null;
    }
  }
}

/**
 * Verify a session still holds an active, non-expired lock for a ticket.
 */
export async function verifyLock(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<boolean> {
  if (!ticketId || !sessionToken) {
    return false;
  }

  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;
  const activeEdition = await getActiveEdition();

  try {
    // If it's a table/bed (stock is undefined), verify if it has already been sold in active edition
    if (!ticket || ticket.stock === undefined) {
      const alreadySold = await isTableSoldInEdition(ticketId, activeEdition.slug);
      if (alreadySold) {
        console.warn(`[LockStore] ❌ verifyLock: Bed/Table ${ticketId} is already sold in ${activeEdition.name}`);
        return false;
      }
    }

    const { data: lockRows, error } = await supabase
      .from('ticket_locks')
      .select('*')
      .eq('lock_key', lockKey)
      .limit(1);

    if (error) throw error;

    const lock = lockRows && lockRows.length > 0 ? lockRows[0] : null;
    if (!lock) {
      return false;
    }

    if (lock.status !== 'locked') {
      return false;
    }

    if (lock.session_token !== sessionToken) {
      return false;
    }

    const expiryTime = new Date(lock.expires_at).getTime();
    if (expiryTime < Date.now()) {
      await supabase
        .from('ticket_locks')
        .delete()
        .eq('lock_key', lockKey)
        .eq('session_token', sessionToken)
        .eq('status', 'locked');
      return false;
    }

    return true;
  } catch (err) {
    console.error('[LockStore] Error in verifyLock:', err);
    return false;
  }
}

/**
 * Extends the lock expiration time when the buyer initiates a payment session (Wompi / Mercado Pago / PSE)
 * so the lock cannot expire while the user is authorizing the payment in their bank app.
 */
export async function extendLockForPayment(
  ticketId: string,
  sessionToken: string,
  ticketsList?: Ticket[],
  durationMs: number = PAYMENT_GATEWAY_LOCK_MS
): Promise<boolean> {
  if (!ticketId || !sessionToken) {
    return false;
  }

  const isValid = await verifyLock(ticketId, sessionToken, ticketsList);
  if (!isValid) {
    return false;
  }

  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;
  const newExpiresAt = new Date(Date.now() + durationMs).toISOString();

  try {
    const { data: updatedRows, error } = await supabase
      .from('ticket_locks')
      .update({ expires_at: newExpiresAt })
      .eq('lock_key', lockKey)
      .eq('session_token', sessionToken)
      .eq('status', 'locked')
      .select('session_token');

    if (error || !updatedRows || updatedRows.length === 0) {
      console.warn(`[LockStore] ❌ Could not extend lock for ${ticketId} (session: ${sessionToken})`);
      return false;
    }

    console.log(`[LockStore] 🔒 Extended lock for ${ticketId} until ${newExpiresAt} during payment gateway flow.`);
    return true;
  } catch (err) {
    console.error('[LockStore] Error in extendLockForPayment:', err);
    return false;
  }
}

/**
 * Release a lock — call when user explicitly exits checkout.
 */
export async function releaseLock(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<void> {
  if (!ticketId || !sessionToken) return;
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    await supabase
      .from('ticket_locks')
      .delete()
      .eq('lock_key', lockKey)
      .eq('session_token', sessionToken)
      .eq('status', 'locked');
  } catch (err) {
    console.error('[LockStore] Error in releaseLock:', err);
  }
}

/**
 * Mark a ticket lock as sold — permanent, no expiry.
 */
export async function markAsSold(ticketId: string, sessionToken?: string, ticketsList?: Ticket[]): Promise<void> {
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined && sessionToken) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    await supabase
      .from('ticket_locks')
      .upsert({
        lock_key: lockKey,
        ticket_id: ticketId,
        session_token: sessionToken || 'admin',
        quantity: 1,
        status: 'sold',
        expires_at: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
  } catch (err) {
    console.error('[LockStore] Error in markAsSold:', err);
  }
}

/**
 * Get remaining lock time in seconds for display.
 */
export async function getRemainingSeconds(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<number> {
  if (!ticketId || !sessionToken) return 0;
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    const { data: lockRows } = await supabase
      .from('ticket_locks')
      .select('expires_at, session_token, status')
      .eq('lock_key', lockKey)
      .limit(1);

    const lock = lockRows && lockRows.length > 0 ? lockRows[0] : null;
    if (!lock || lock.session_token !== sessionToken || lock.status !== 'locked') {
      return 0;
    }

    const expiryTime = new Date(lock.expires_at).getTime();
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  } catch (err) {
    console.error('[LockStore] Error in getRemainingSeconds:', err);
    return 0;
  }
}

/**
 * Get current status of a ticket for active edition.
 */
export async function getTicketStatus(ticketId: string, ticketsList?: Ticket[]): Promise<'available' | 'locked' | 'sold'> {
  if (ticketId === 'invitado_anytime' || ticketId === 'invitado-anytime') {
    return 'available';
  }

  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const activeEdition = await getActiveEdition();

  if (ticket && ticket.stock !== undefined) {
    await cleanExpiredLocks();

    try {
      // 1. Get sold count for active edition
      const { data: soldData } = await supabase
        .from('purchased_tickets')
        .select('total_accesos')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .eq('edition_slug', activeEdition.slug);
      
      const soldCount = (soldData || []).reduce((sum, row) => sum + Number(row.total_accesos), 0);

      // 2. Get locked count
      const { data: lockedData } = await supabase
        .from('ticket_locks')
        .select('quantity')
        .eq('ticket_id', ticketId)
        .eq('status', 'locked')
        .gt('expires_at', new Date().toISOString());

      const lockedCount = (lockedData || []).reduce((sum, row) => sum + Number(row.quantity), 0);

      // 3. Get total stock
      const { data: dbTicket } = await supabase
        .from('boleteria_individual')
        .select('stock')
        .eq('id', ticketId)
        .maybeSingle();
      
      const totalStock = dbTicket ? Number(dbTicket.stock) : (ticket.stock || 100);

      if (soldCount >= totalStock) {
        return 'sold';
      }
      if (soldCount + lockedCount >= totalStock) {
        return 'locked';
      }
      return 'available';
    } catch (err) {
      console.error('[LockStore] Error in getTicketStatus:', err);
      return 'available';
    }
  } else {
    // Table/Cama ticket status
    try {
      // 1. Check if there's an approved purchase in purchased_tickets or orders for active edition
      const alreadySold = await isTableSoldInEdition(ticketId, activeEdition.slug);
      if (alreadySold) return 'sold';

      // 2. Check locks
      const { data: lockRows } = await supabase
        .from('ticket_locks')
        .select('*')
        .eq('lock_key', ticketId)
        .limit(1);

      const lock = lockRows && lockRows.length > 0 ? lockRows[0] : null;
      if (!lock) return 'available';
      if (lock.status === 'sold') return 'sold';

      const expiryTime = new Date(lock.expires_at).getTime();
      if (expiryTime < Date.now()) {
        await supabase
          .from('ticket_locks')
          .delete()
          .eq('lock_key', ticketId)
          .eq('status', 'locked');
        return 'available';
      }
      return 'locked';
    } catch (err) {
      console.error('[LockStore] Error in getTicketStatus table:', err);
      return 'available';
    }
  }
}

/**
 * Get remaining available stock (total stock - sold - locked) for active edition.
 */
export async function getRemainingStock(ticketId: string, totalStock: number): Promise<number> {
  const isGuest = ticketId === 'invitado_anytime' || ticketId === 'invitado-anytime';
  await cleanExpiredLocks();
  const activeEdition = await getActiveEdition();

  try {
    // 1. Get sold count for active edition
    const { data: soldData } = await supabase
      .from('purchased_tickets')
      .select('total_accesos')
      .eq('ticket_id', ticketId)
      .eq('status', 'paid')
      .eq('edition_slug', activeEdition.slug);
    
    const soldCount = (soldData || []).reduce((sum, row) => sum + Number(row.total_accesos), 0);

    // 2. Get locked count
    const { data: lockedData } = await supabase
      .from('ticket_locks')
      .select('quantity')
      .eq('ticket_id', ticketId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString());

    const lockedCount = (lockedData || []).reduce((sum, row) => sum + Number(row.quantity), 0);

    // 3. Get total stock
    const { data: dbTicket } = await supabase
      .from('boleteria_individual')
      .select('stock')
      .eq('id', ticketId)
      .maybeSingle();
    
    const rawStock = dbTicket ? Number(dbTicket.stock) : totalStock;
    const finalStock = isGuest ? Math.max(rawStock || 5000, 5000) : rawStock;

    return isGuest ? Math.max(100, finalStock - soldCount - lockedCount) : Math.max(0, finalStock - soldCount - lockedCount);
  } catch (err) {
    console.error('[LockStore] Error in getRemainingStock:', err);
    return isGuest ? Math.max(totalStock || 5000, 5000) : totalStock;
  }
}

/**
 * Batch-enriches all tickets with `status` and `remaining` stock using a single set of queries
 * instead of N+1 queries per ticket.
 */
export async function getTicketsWithStatusAndStock(tickets: Ticket[]) {
  await cleanExpiredLocks();
  const activeEdition = await getActiveEdition();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  try {
    const [
      { data: purchasedRows },
      { data: lockRows },
      { data: dbIndividualRows },
    ] = await Promise.all([
      supabase
        .from('purchased_tickets')
        .select('ticket_id, total_accesos')
        .eq('status', 'paid')
        .eq('edition_slug', activeEdition.slug),
      supabase
        .from('ticket_locks')
        .select('lock_key, ticket_id, quantity, status, expires_at'),
      supabase
        .from('boleteria_individual')
        .select('id, stock'),
    ]);

    const soldByTicket = new Map<string, number>();
    const hasPaidPurchase = new Set<string>();
    for (const row of purchasedRows || []) {
      const tid = row.ticket_id;
      if (!tid) continue;
      hasPaidPurchase.add(tid);
      soldByTicket.set(tid, (soldByTicket.get(tid) || 0) + (Number(row.total_accesos) || 0));
    }

    const lockedQtyByTicket = new Map<string, number>();
    const lockByKey = new Map<string, any>();
    for (const row of lockRows || []) {
      if (row.lock_key) {
        lockByKey.set(row.lock_key, row);
      }
      if (row.status === 'locked' && row.expires_at && row.expires_at > nowIso && row.ticket_id) {
        lockedQtyByTicket.set(
          row.ticket_id,
          (lockedQtyByTicket.get(row.ticket_id) || 0) + (Number(row.quantity) || 0)
        );
      }
    }

    const stockByTicket = new Map<string, number>();
    for (const row of dbIndividualRows || []) {
      if (row.id !== undefined) {
        stockByTicket.set(row.id, Number(row.stock));
      }
    }

    return tickets.map((t) => {
      const isGuest = t.id === 'invitado_anytime' || t.id === 'invitado-anytime';
      if (t.stock !== undefined) {
        const soldCount = soldByTicket.get(t.id) || 0;
        const lockedCount = lockedQtyByTicket.get(t.id) || 0;
        const dbStock = stockByTicket.has(t.id) ? stockByTicket.get(t.id)! : (t.stock || 100);
        const totalStock = isGuest ? Math.max(dbStock || 5000, 5000) : dbStock;

        let status: 'available' | 'locked' | 'sold' = 'available';
        if (!isGuest) {
          if (soldCount >= totalStock) {
            status = 'sold';
          } else if (soldCount + lockedCount >= totalStock) {
            status = 'locked';
          }
        }

        const remaining = isGuest
          ? Math.max(100, totalStock - soldCount - lockedCount)
          : Math.max(0, totalStock - soldCount - lockedCount);

        return {
          ...t,
          status,
          remaining,
        };
      } else {
        // Table / Cama
        let status: 'available' | 'locked' | 'sold' = 'available';
        if (hasPaidPurchase.has(t.id)) {
          status = 'sold';
        } else {
          const lock = lockByKey.get(t.id);
          if (lock) {
            if (lock.status === 'sold') {
              status = 'sold';
            } else if (lock.expires_at && new Date(lock.expires_at).getTime() >= nowMs) {
              status = 'locked';
            }
          }
        }
        return {
          ...t,
          status,
          remaining: undefined,
        };
      }
    });
  } catch (err) {
    console.error('[LockStore] Error in getTicketsWithStatusAndStock, falling back:', err);
    return Promise.all(
      tickets.map(async (t) => ({
        ...t,
        status: await getTicketStatus(t.id, tickets),
        remaining: t.stock !== undefined ? await getRemainingStock(t.id, t.stock) : undefined,
      }))
    );
  }
}

/**
 * Get quantity for an active lock.
 */
export async function getLockQuantity(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<number> {
  if (!ticketId || !sessionToken) return 0;
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    const { data: lockRows } = await supabase
      .from('ticket_locks')
      .select('quantity, expires_at, session_token, status')
      .eq('lock_key', lockKey)
      .limit(1);

    const lock = lockRows && lockRows.length > 0 ? lockRows[0] : null;
    if (!lock || lock.session_token !== sessionToken || lock.status !== 'locked') {
      return 0;
    }

    const expiryTime = new Date(lock.expires_at).getTime();
    if (expiryTime < Date.now()) {
      return 0;
    }
    return lock.quantity || 1;
  } catch (err) {
    console.error('[LockStore] Error in getLockQuantity:', err);
    return 0;
  }
}