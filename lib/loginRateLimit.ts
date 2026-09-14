interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

const MAX_ATTEMPTS = 4;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes lockout

// In-memory store of login attempt records
const attemptStore = new Map<string, AttemptRecord>();

// Cleanup stale records older than 1 hour to avoid memory leak
function cleanupStaleRecords() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  for (const [key, record] of attemptStore.entries()) {
    if (now - record.lastAttemptAt > oneHour && (!record.lockedUntil || now > record.lockedUntil)) {
      attemptStore.delete(key);
    }
  }
}

export function getLockStatus(key: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  cleanupStaleRecords();
  const normalizedKey = key.trim().toLowerCase();
  const record = attemptStore.get(normalizedKey);
  const now = Date.now();

  if (!record) {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMs = record.lockedUntil - now;
    return {
      isLocked: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      attempts: record.count,
    };
  }

  // Lock has expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    attemptStore.delete(normalizedKey);
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }

  return { isLocked: false, remainingSeconds: 0, attempts: record.count };
}

export function recordFailedAttempt(key: string): { attempts: number; isLocked: boolean; newlyLocked: boolean } {
  cleanupStaleRecords();
  const normalizedKey = key.trim().toLowerCase();
  const now = Date.now();
  let record = attemptStore.get(normalizedKey);

  if (!record) {
    record = { count: 0, lockedUntil: null, lastAttemptAt: now };
  }

  record.count += 1;
  record.lastAttemptAt = now;

  let newlyLocked = false;
  if (record.count >= MAX_ATTEMPTS) {
    if (!record.lockedUntil || now >= record.lockedUntil) {
      record.lockedUntil = now + LOCKOUT_MS;
      newlyLocked = true;
    }
  }

  attemptStore.set(normalizedKey, record);

  return {
    attempts: record.count,
    isLocked: Boolean(record.lockedUntil && now < record.lockedUntil),
    newlyLocked,
  };
}

export function resetAttempts(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  attemptStore.delete(normalizedKey);
}
