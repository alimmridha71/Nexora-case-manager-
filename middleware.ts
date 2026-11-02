import { type NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, CLIENT_COOKIE_NAME, verifyToken, verifyClientToken, buildLoginRedirect } from './lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');
  const isClientPage = pathname.startsWith('/client') && pathname !== '/client/login';

  if (isClientPage) {
    const clientToken = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    const { isValid: clientValid } = clientToken ? await verifyClientToken(clientToken) : { isValid: false };
    if (!clientValid) {
      const response = NextResponse.redirect(buildLoginRedirect(request.url, pathname, clientToken ? 'invalid_session' : undefined, '/client/login'));
      if (clientToken) response.cookies.delete(CLIENT_COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Unified single verification path
  const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { isValid } = adminToken ? await verifyToken(adminToken) : { isValid: false };

  if (!isValid) {
    if (isAdminApi) {
      const response = NextResponse.json(
        { error: 'Unauthorized: Valid administrator authentication required.' },
        { status: adminToken ? 403 : 401 }
      );
      if (adminToken) response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    // Admin UI route: build redirect using shared helper and clean cookie if invalid
    const reason = adminToken ? 'invalid_session' : undefined;
    const redirectUrl = buildLoginRedirect(request.url, pathname, reason);
    const response = NextResponse.redirect(redirectUrl);
    if (adminToken) response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/client/:path*'],
};
