#!/usr/bin/env node
// Usage: npm run hash-password -- "your long admin password"
// Prints a value for ADMIN_PASSWORD_HASH (format: scrypt:<salt-base64>:<hash-base64>).
import crypto from 'node:crypto';

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "<password with at least 12 characters>"');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString('base64')}:${hash.toString('base64')}`);
