import type { TicketLock } from '@/types/checkout';

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
 * Try to lock a ticket for a session.
 * Returns the lock if successful, null if already locked by someone else.
 */
export function acquireLock(ticketId: string, sessionToken: string): TicketLock | null {
  cleanExpiredLocks();

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
  };

  lockStore.set(ticketId, lock);
  return lock;
}

/**
 * Verify a session still holds the lock for a ticket.
 */
export function verifyLock(ticketId: string, sessionToken: string): boolean {
  const lock = lockStore.get(ticketId);
  if (!lock) return false;
  if (lock.sessionToken !== sessionToken) return false;
  if (lock.expiresAt < Date.now()) {
    lockStore.delete(ticketId);
    return false;
  }
  return true;
}

/**
 * Release a lock — call after successful payment or user cancels.
 */
export function releaseLock(ticketId: string, sessionToken: string): void {
  const lock = lockStore.get(ticketId);
  if (lock && lock.sessionToken === sessionToken) {
    lockStore.delete(ticketId);
  }
}

/**
 * Mark a ticket as sold — permanent, no expiry.
 */
export function markAsSold(ticketId: string): void {
  const lock = lockStore.get(ticketId);
  if (lock) {
    lockStore.set(ticketId, { ...lock, status: 'sold', expiresAt: Infinity });
  }
}

/**
 * Get remaining lock time in seconds for display.
 */
export function getRemainingSeconds(ticketId: string, sessionToken: string): number {
  const lock = lockStore.get(ticketId);
  if (!lock || lock.sessionToken !== sessionToken) return 0;
  return Math.max(0, Math.floor((lock.expiresAt - Date.now()) / 1000));
}

/**
 * Get current status of a ticket.
 */
export function getTicketStatus(ticketId: string): 'available' | 'locked' | 'sold' {
  const lock = lockStore.get(ticketId);
  if (!lock) return 'available';
  if (lock.status === 'sold') return 'sold';
  if (lock.expiresAt < Date.now()) {
    lockStore.delete(ticketId);
    return 'available';
  }
  return 'locked';
}

/**
 * Remove all expired locks — called on each operation to keep memory clean.
 */
function cleanExpiredLocks(): void {
  const now = Date.now();
  for (const [ticketId, lock] of lockStore.entries()) {
    if (lock.status !== 'sold' && lock.expiresAt < now) {
      lockStore.delete(ticketId);
    }
  }
}