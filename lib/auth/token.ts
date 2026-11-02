// Signing and cryptographic verification of admin session tokens.
// Edge-safe: only uses `jose` and Web Crypto (no Node-only imports), so it can run in middleware.
import { SignJWT, jwtVerify } from 'jose';
import { CONFIG } from '../config';

export interface AdminSession {
  email: string;
  role: 'admin';
  jti?: string;
  exp?: number;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(CONFIG.admin.sessionSecret);
}

/** Sign an HS256 JWT with a unique jti and the configured session lifetime. */
export async function createAdminToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(globalThis.crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${CONFIG.admin.sessionTtlSeconds}s`)
    .sign(secretKey());
}

/** Check signature + expiry + payload shape only. Revocation is checked in session.ts. */
export async function verifyTokenSignature(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (payload.role !== 'admin' || typeof payload.email !== 'string') return null;
    return {
      email: payload.email,
      role: 'admin',
      jti: typeof payload.jti === 'string' ? payload.jti : undefined,
      exp: payload.exp,
    };
  } catch {
    return null; // bad signature, expired or malformed
  }
}

export interface ClientSession {
  clientId: number;
  email: string;
  role: 'client';
  jti?: string;
  exp?: number;
}

/** Client portal token. Uses a different `role` claim, so it can never pass the admin guard. */
export async function createClientToken(clientId: number, email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), role: 'client', cid: clientId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(globalThis.crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${CONFIG.client.sessionTtlSeconds}s`)
    .sign(secretKey());
}

export async function verifyClientTokenSignature(token: string): Promise<ClientSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (payload.role !== 'client' || typeof payload.email !== 'string' || typeof payload.cid !== 'number') return null;
    return {
      clientId: payload.cid,
      email: payload.email,
      role: 'client',
      jti: typeof payload.jti === 'string' ? payload.jti : undefined,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
