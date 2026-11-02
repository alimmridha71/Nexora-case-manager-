// Public auth API. Middleware imports './lib/auth/session' directly to stay edge-safe.
export type { AdminSession, ClientSession } from './token';
export { createAdminToken, createClientToken } from './token';
export { createThrottle } from './throttle';
export { verifyAdminPassword, hashPassword, safeEqual, verifyPasswordHash, generateTemporaryPassword, dummyPasswordCheck } from './password';
export {
  ADMIN_COOKIE_NAME,
  CLIENT_COOKIE_NAME,
  verifyClientToken,
  revokeClientToken,
  verifyClientSession,
  requireClient,
  verifyToken,
  revokeAdminToken,
  verifyAdminSession,
  requireAdmin,
  buildLoginRedirect,
} from './session';
