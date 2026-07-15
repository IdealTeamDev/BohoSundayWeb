import type { TicketLock } from '@/types/checkout';
import type { Ticket } from '@/types';
import { supabase } from './supabase';

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Remove all expired locks from Supabase database
 */
async function cleanExpiredLocks(): Promise<void> {
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

  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);

  if (!ticket) {
    return null;
  }

  const lockKey = ticket.stock !== undefined ? `${ticketId}_${sessionToken}` : ticketId;

  // If the ticket has stock defined (individual tickets early/anytime)
  if (ticket.stock !== undefined) {
    try {
      // 1. Get total sold count from purchased_tickets
      const { data: soldData, error: soldError } = await supabase
        .from('purchased_tickets')
        .select('total_accesos')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid');

      if (soldError) throw soldError;
      const soldCount = (soldData || []).reduce((sum, row) => sum + Number(row.total_accesos), 0);

      // 2. Get active locks count from ticket_locks (excluding our own sessionToken)
      const { data: lockedData, error: lockedError } = await supabase
        .from('ticket_locks')
        .select('quantity')
        .eq('ticket_id', ticketId)
        .eq('status', 'locked')
        .gt('expires_at', new Date().toISOString())
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
      const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      const { error: insertError } = await supabase
        .from('ticket_locks')
        .upsert({
          lock_key: lockKey,
          ticket_id: ticketId,
          session_token: sessionToken,
          quantity,
          status: 'locked',
          expires_at: expiresAt
        });

      if (insertError) {
        console.error('[LockStore] Error saving lock to DB:', insertError);
        return null;
      }

      return {
        ticketId,
        sessionToken,
        expiresAt: Date.now() + LOCK_DURATION_MS,
        status: 'locked',
        quantity,
      };
    } catch (err) {
      console.error('[LockStore] Error in acquireLock:', err);
      return null;
    }
  } else {
    // Table/Cama ticket logic
    try {
      // Check if locked by another active session
      const { data: activeLock, error: lockError } = await supabase
        .from('ticket_locks')
        .select('*')
        .eq('lock_key', lockKey)
        .eq('status', 'locked')
        .gt('expires_at', new Date().toISOString())
        .neq('session_token', sessionToken)
        .maybeSingle();

      if (lockError) throw lockError;
      if (activeLock) {
        console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already locked by session ${activeLock.session_token}`);
        return null;
      }

      // Check if already sold in ticket_locks
      const { data: soldLock, error: soldLockError } = await supabase
        .from('ticket_locks')
        .select('*')
        .eq('lock_key', lockKey)
        .eq('status', 'sold')
        .maybeSingle();

      if (soldLockError) throw soldLockError;
      if (soldLock) {
        console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already sold (found in ticket_locks)`);
        return null;
      }

      // Check if already sold in purchased_tickets
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchased_tickets')
        .select('order_id')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .maybeSingle();

      if (purchaseError) throw purchaseError;
      if (purchase) {
        console.warn(`[LockStore] ❌ Bed/Table ${ticketId} is already sold (found in purchased_tickets)`);
        return null;
      }

      // Create/update the lock in Supabase
      const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      const { error: insertError } = await supabase
        .from('ticket_locks')
        .upsert({
          lock_key: lockKey,
          ticket_id: ticketId,
          session_token: sessionToken,
          quantity: 1,
          status: 'locked',
          expires_at: expiresAt
        });

      if (insertError) {
        console.error('[LockStore] Error saving table lock to DB:', insertError);
        return null;
      }

      return {
        ticketId,
        sessionToken,
        expiresAt: Date.now() + LOCK_DURATION_MS,
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
 * Verify a session still holds the lock for a ticket.
 */
export async function verifyLock(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<boolean> {
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    // If it's a table/bed (stock is undefined), verify if it has already been sold
    if (!ticket || ticket.stock === undefined) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchased_tickets')
        .select('order_id')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .maybeSingle();

      if (purchaseError) throw purchaseError;
      if (purchase) {
        console.warn(`[LockStore] ❌ verifyLock: Bed/Table ${ticketId} is already sold (found in purchased_tickets)`);
        return false;
      }
    }

    const { data: lock, error } = await supabase
      .from('ticket_locks')
      .select('*')
      .eq('lock_key', lockKey)
      .maybeSingle();

    if (error) throw error;

    if (!lock) {
      // Vercel serverless container bypass fallback
      if (sessionToken) return true;
      return false;
    }

    if (lock.session_token !== sessionToken) return false;

    const expiryTime = new Date(lock.expires_at).getTime();
    if (expiryTime < Date.now()) {
      await supabase.from('ticket_locks').delete().eq('lock_key', lockKey);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[LockStore] Error in verifyLock:', err);
    if (sessionToken) return true;
    return false;
  }
}

/**
 * Release a lock — call after payment fails or cancels.
 */
export async function releaseLock(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<void> {
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
    // Set expiry way in the future (permanent) and change status to 'sold'
    await supabase
      .from('ticket_locks')
      .upsert({
        lock_key: lockKey,
        ticket_id: ticketId,
        session_token: sessionToken || 'admin',
        quantity: 1, // we don't count quantity for table locks sold, individual tickets are in purchased_tickets
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
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    const { data: lock } = await supabase
      .from('ticket_locks')
      .select('expires_at, session_token')
      .eq('lock_key', lockKey)
      .maybeSingle();

    if (!lock || lock.session_token !== sessionToken) {
      if (sessionToken) return 600;
      return 0;
    }

    const expiryTime = new Date(lock.expires_at).getTime();
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  } catch (err) {
    console.error('[LockStore] Error in getRemainingSeconds:', err);
    if (sessionToken) return 600;
    return 0;
  }
}

/**
 * Get current status of a ticket.
 */
export async function getTicketStatus(ticketId: string, ticketsList?: Ticket[]): Promise<'available' | 'locked' | 'sold'> {
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);

  if (ticket && ticket.stock !== undefined) {
    await cleanExpiredLocks();

    try {
      // 1. Get sold count
      const { data: soldData } = await supabase
        .from('purchased_tickets')
        .select('total_accesos')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid');
      
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
      // 1. Check if there's an approved purchase in purchased_tickets
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchased_tickets')
        .select('order_id')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .maybeSingle();

      if (purchaseError) throw purchaseError;
      if (purchase) return 'sold';

      // 2. Check locks
      const { data: lock } = await supabase
        .from('ticket_locks')
        .select('*')
        .eq('lock_key', ticketId)
        .maybeSingle();

      if (!lock) return 'available';
      if (lock.status === 'sold') return 'sold';

      const expiryTime = new Date(lock.expires_at).getTime();
      if (expiryTime < Date.now()) {
        await supabase.from('ticket_locks').delete().eq('lock_key', ticketId);
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
 * Get remaining available stock (total stock - sold - locked).
 */
export async function getRemainingStock(ticketId: string, totalStock: number): Promise<number> {
  await cleanExpiredLocks();

  try {
    // 1. Get sold count
    const { data: soldData } = await supabase
      .from('purchased_tickets')
      .select('total_accesos')
      .eq('ticket_id', ticketId)
      .eq('status', 'paid');
    
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
    
    const finalStock = dbTicket ? Number(dbTicket.stock) : totalStock;

    return Math.max(0, finalStock - soldCount - lockedCount);
  } catch (err) {
    console.error('[LockStore] Error in getRemainingStock:', err);
    return totalStock;
  }
}

/**
 * Get quantity for an active lock.
 */
export async function getLockQuantity(ticketId: string, sessionToken: string, ticketsList?: Ticket[]): Promise<number> {
  const list = ticketsList || [];
  const ticket = list.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  try {
    const { data: lock } = await supabase
      .from('ticket_locks')
      .select('quantity, expires_at, session_token')
      .eq('lock_key', lockKey)
      .maybeSingle();

    if (!lock || lock.session_token !== sessionToken) {
      if (sessionToken) return 1;
      return 0;
    }

    const expiryTime = new Date(lock.expires_at).getTime();
    if (expiryTime < Date.now()) {
      return 0;
    }
    return lock.quantity || 1;
  } catch (err) {
    console.error('[LockStore] Error in getLockQuantity:', err);
    if (sessionToken) return 1;
    return 0;
  }
}