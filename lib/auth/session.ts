// Cookie/session handling and the single admin guard used by middleware, actions and routes.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CONFIG } from '../config';
import { verifyTokenSignature, verifyClientTokenSignature, type AdminSession, type ClientSession } from './token';
import { isRevoked, revokeJti } from './revocation';

export const ADMIN_COOKIE_NAME = CONFIG.admin.cookieName;
export const CLIENT_COOKIE_NAME = CONFIG.client.cookieName;

/** The only token verifier: signature + expiry, then revocation (fail closed). */
export async function verifyToken(token: string): Promise<{ isValid: boolean; session?: AdminSession }> {
  if (!token) return { isValid: false };
  const session = await verifyTokenSignature(token);
  if (!session) return { isValid: false };
  if (session.jti && (await isRevoked(session.jti))) return { isValid: false };
  return { isValid: true, session };
}

/** Revoke a session token (used on logout). Invalid tokens are ignored. */
export async function revokeAdminToken(token: string): Promise<void> {
  const session = await verifyTokenSignature(token);
  if (session?.jti) {
    await revokeJti(session.jti, session.exp);
  }
}

/** Read the cookie and verify it. Used by server actions and API route handlers. */
export async function verifyAdminSession(): Promise<{ isValid: boolean; session?: AdminSession }> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
    return token ? await verifyToken(token) : { isValid: false };
  } catch (err) {
    console.error('Admin session verification error:', err);
    return { isValid: false };
  }
}

/** Guard for server actions / pages: redirects to login when there is no valid admin session. */
export async function requireAdmin(redirectTo: string = '/admin/login'): Promise<AdminSession> {
  const auth = await verifyAdminSession();
  if (!auth.isValid || !auth.session) {
    redirect(redirectTo);
  }
  return auth.session;
}

/** Client portal: signature + expiry, then revocation (fail closed). */
export async function verifyClientToken(token: string): Promise<{ isValid: boolean; session?: ClientSession }> {
  if (!token) return { isValid: false };
  const session = await verifyClientTokenSignature(token);
  if (!session) return { isValid: false };
  if (session.jti && (await isRevoked(session.jti))) return { isValid: false };
  return { isValid: true, session };
}

export async function revokeClientToken(token: string): Promise<void> {
  const session = await verifyClientTokenSignature(token);
  if (session?.jti) {
    await revokeJti(session.jti, session.exp);
  }
}

export async function verifyClientSession(): Promise<{ isValid: boolean; session?: ClientSession }> {
  try {
    const token = (await cookies()).get(CLIENT_COOKIE_NAME)?.value;
    return token ? await verifyClientToken(token) : { isValid: false };
  } catch (err) {
    console.error('Client session verification error:', err);
    return { isValid: false };
  }
}

/** Guard for client pages and actions: redirects to the client login when not signed in. */
export async function requireClient(redirectTo: string = '/client/login'): Promise<ClientSession> {
  const auth = await verifyClientSession();
  if (!auth.isValid || !auth.session) {
    redirect(redirectTo);
  }
  return auth.session;
}

/** Build the login redirect URL used by middleware. */
export function buildLoginRedirect(baseUrl: string, pathname: string, reason?: string, loginPath: string = '/admin/login'): URL {
  const loginUrl = new URL(loginPath, baseUrl);
  loginUrl.searchParams.set('redirect', pathname);
  if (reason) loginUrl.searchParams.set('error', reason);
  return loginUrl;
}
