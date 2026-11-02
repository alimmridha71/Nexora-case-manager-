// Password verification (Node runtime only: server actions, never middleware).
import crypto from 'crypto';
import { CONFIG } from '../config';

const sha256 = (value: string): Buffer => crypto.createHash('sha256').update(value, 'utf8').digest();

/** Constant-time string comparison that does not leak length (compares fixed-size digests). */
export function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256(a), sha256(b));
}

/** Create a salted scrypt hash in the form `scrypt:<salt-base64>:<hash-base64>`. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('base64')}:${hash.toString('base64')}`;
}

/** Verify a password against a stored `scrypt:<salt>:<hash>` value. */
export function verifyPasswordHash(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split(':');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/** Uses ADMIN_PASSWORD_HASH when set, otherwise falls back to ADMIN_DEFAULT_PASSWORD. */
export function verifyAdminPassword(input: string): boolean {
  const stored = CONFIG.admin.passwordHash;
  return stored ? verifyPasswordHash(input, stored) : safeEqual(input, CONFIG.admin.defaultPassword);
}

/** Random, human-typable temporary password (shown once to the admin who creates the account). */
export function generateTemporaryPassword(): string {
  return crypto.randomBytes(12).toString('base64url');
}

/** Burn comparable CPU time when an account does not exist, so lookups cannot be timed. */
export function dummyPasswordCheck(password: string): void {
  verifyPasswordHash(password, 'scrypt:AAAAAAAAAAAAAAAAAAAAAA==:' + Buffer.alloc(64).toString('base64'));
}
