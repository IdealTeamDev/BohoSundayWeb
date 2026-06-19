import type { TicketLock } from '@/types/checkout';
import { tickets } from '@/data/tickets';

// In-memory store — replace with Redis when DB is ready
// We use globalThis to persist the Map in Next.js development mode across HMR/hot-reloads
const globalForLockStore = globalThis as unknown as {
  lockStore?: Map<string, TicketLock>;
};

const lockStore = globalForLockStore.lockStore ?? new Map<string, TicketLock>();

if (process.env.NODE_ENV !== 'production') {
  globalForLockStore.lockStore = lockStore;
}

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Remove all expired locks — called on each operation to keep memory clean.
 */
function cleanExpiredLocks(): void {
  const now = Date.now();
  for (const [key, lock] of lockStore.entries()) {
    if (lock.status !== 'sold' && lock.expiresAt < now) {
      lockStore.delete(key);
    }
  }
}

/**
 * Try to lock a ticket for a session.
 * Returns the lock if successful, null if already locked or no stock.
 */
export function acquireLock(ticketId: string, sessionToken: string, quantity: number = 1): TicketLock | null {
  cleanExpiredLocks();

  const ticket = tickets.find((t) => t.id === ticketId);

  // If the ticket has a stock defined (individual ticket)
  if (ticket && ticket.stock !== undefined) {
    let soldCount = 0;
    let lockedCount = 0;

    for (const [key, lock] of lockStore.entries()) {
      if (lock.ticketId === ticketId) {
        if (lock.status === 'sold') {
          soldCount += lock.quantity || 1;
        } else if (lock.status === 'locked' && lock.expiresAt > Date.now()) {
          // Do not count the current session's lock as active/new
          if (lock.sessionToken !== sessionToken) {
            lockedCount += lock.quantity || 1;
          }
        }
      }
    }

    // Check if the total sold + other locked tickets + requested quantity exceeds capacity
    if (soldCount + lockedCount + quantity > ticket.stock) {
      return null;
    }

    const lockKey = `${ticketId}_${sessionToken}`;
    const lock: TicketLock = {
      ticketId,
      sessionToken,
      expiresAt: Date.now() + LOCK_DURATION_MS,
      status: 'locked',
      quantity,
    };

    lockStore.set(lockKey, lock);
    return lock;
  } else {
    // Table ticket logic (1 table/ticket per ID)
    const existing = lockStore.get(ticketId);

    // Already locked by a different session
    if (existing && existing.sessionToken !== sessionToken && existing.expiresAt > Date.now()) {
      return null;
    }

    const lock: TicketLock = {
      ticketId,
      sessionToken,
      expiresAt: Date.now() + LOCK_DURATION_MS,
      status: 'locked',
      quantity: 1,
    };

    lockStore.set(ticketId, lock);
    return lock;
  }
}

/**
 * Verify a session still holds the lock for a ticket.
 */
export function verifyLock(ticketId: string, sessionToken: string): boolean {
  const ticket = tickets.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  const lock = lockStore.get(lockKey);
  if (!lock) return false;
  if (lock.sessionToken !== sessionToken) return false;
  if (lock.expiresAt < Date.now()) {
    lockStore.delete(lockKey);
    return false;
  }
  return true;
}

/**
 * Release a lock — call after successful payment or user cancels.
 */
export function releaseLock(ticketId: string, sessionToken: string): void {
  const ticket = tickets.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  const lock = lockStore.get(lockKey);
  if (lock && lock.sessionToken === sessionToken) {
    lockStore.delete(lockKey);
  }
}

/**
 * Mark a ticket as sold — permanent, no expiry.
 */
export function markAsSold(ticketId: string, sessionToken?: string): void {
  const ticket = tickets.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined && sessionToken) ? `${ticketId}_${sessionToken}` : ticketId;

  const lock = lockStore.get(lockKey);
  if (lock) {
    lockStore.set(lockKey, { ...lock, status: 'sold', expiresAt: Infinity });
  }
}

/**
 * Get remaining lock time in seconds for display.
 */
export function getRemainingSeconds(ticketId: string, sessionToken: string): number {
  const ticket = tickets.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  const lock = lockStore.get(lockKey);
  if (!lock || lock.sessionToken !== sessionToken) return 0;
  return Math.max(0, Math.floor((lock.expiresAt - Date.now()) / 1000));
}

/**
 * Get current status of a ticket.
 */
export function getTicketStatus(ticketId: string): 'available' | 'locked' | 'sold' {
  const ticket = tickets.find((t) => t.id === ticketId);

  if (ticket && ticket.stock !== undefined) {
    cleanExpiredLocks();
    let soldCount = 0;
    let lockedCount = 0;

    for (const [key, lock] of lockStore.entries()) {
      if (lock.ticketId === ticketId) {
        if (lock.status === 'sold') {
          soldCount += lock.quantity || 1;
        } else if (lock.status === 'locked' && lock.expiresAt > Date.now()) {
          lockedCount += lock.quantity || 1;
        }
      }
    }

    if (soldCount >= ticket.stock) {
      return 'sold';
    }
    if (soldCount + lockedCount >= ticket.stock) {
      return 'locked';
    }
    return 'available';
  } else {
    // Table ticket
    const lock = lockStore.get(ticketId);
    if (!lock) return 'available';
    if (lock.status === 'sold') return 'sold';
    if (lock.expiresAt < Date.now()) {
      lockStore.delete(ticketId);
      return 'available';
    }
    return 'locked';
  }
}

/**
 * Get remaining available stock (total stock - sold - locked).
 */
export function getRemainingStock(ticketId: string, totalStock: number): number {
  cleanExpiredLocks();
  let soldCount = 0;
  let lockedCount = 0;

  for (const [key, lock] of lockStore.entries()) {
    if (lock.ticketId === ticketId) {
      if (lock.status === 'sold') {
        soldCount += lock.quantity || 1;
      } else if (lock.status === 'locked' && lock.expiresAt > Date.now()) {
        lockedCount += lock.quantity || 1;
      }
    }
  }

  return Math.max(0, totalStock - soldCount - lockedCount);
}

/**
 * Get quantity for an active lock.
 */
export function getLockQuantity(ticketId: string, sessionToken: string): number {
  const ticket = tickets.find((t) => t.id === ticketId);
  const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_${sessionToken}` : ticketId;

  const lock = lockStore.get(lockKey);
  if (!lock || lock.sessionToken !== sessionToken || lock.expiresAt < Date.now()) return 0;
  return lock.quantity || 1;
}