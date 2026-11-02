// Brute-force throttle shared by admin and client logins. In-memory per server instance, bounded.
import { CONFIG } from '../config';

interface Attempt {
  count: number;
  lastAttempt: number;
}

const MAX_TRACKED_KEYS = 5000;

export function createThrottle(now: () => number = Date.now) {
  const attempts = new Map<string, Attempt>();

  function prune(): void {
    const t = now();
    for (const [key, rec] of attempts) {
      if (t - rec.lastAttempt >= CONFIG.admin.loginLockoutMs) attempts.delete(key);
    }
    while (attempts.size >= MAX_TRACKED_KEYS) {
      const oldest = attempts.keys().next().value;
      if (oldest === undefined) break;
      attempts.delete(oldest);
    }
  }

  return {
    /** Minutes remaining if the key is locked, otherwise 0. */
    lockedMinutes(key: string): number {
      prune();
      const rec = attempts.get(key);
      if (!rec || rec.count < CONFIG.admin.maxLoginAttempts) return 0;
      const remaining = CONFIG.admin.loginLockoutMs - (now() - rec.lastAttempt);
      return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
    },
    fail(key: string): void {
      const rec = attempts.get(key) || { count: 0, lastAttempt: now() };
      attempts.set(key, { count: rec.count + 1, lastAttempt: now() });
    },
    clear(key: string): void {
      attempts.delete(key);
    },
  };
}
