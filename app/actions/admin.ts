'use server';

import { createAdminToken, revokeAdminToken, ADMIN_COOKIE_NAME, verifyAdminPassword, safeEqual, createThrottle } from '@/lib/auth';
import { CONFIG } from '@/lib/config';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const throttle = createThrottle();

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export async function adminLoginAction(formData: FormData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { success: false, error: 'Please enter both administrator email and password.' };
  }

  const key = `${await clientIp()}|${email}`;
  const lockedFor = throttle.lockedMinutes(key);
  if (lockedFor > 0) {
    return {
      success: false,
      error: `Too many failed login attempts. Access temporarily locked. Please retry after ${lockedFor} minutes.`,
    };
  }

  // Check email AND password every time (no early exit that reveals which one was wrong)
  let emailOk = false;
  let passwordOk = false;
  try {
    emailOk = safeEqual(email, CONFIG.admin.email.trim().toLowerCase());
    passwordOk = verifyAdminPassword(password);
  } catch (err) {
    console.error('Admin login misconfiguration:', err instanceof Error ? err.message : err);
  }

  if (!emailOk || !passwordOk) {
    throttle.fail(key);
    return { success: false, error: 'Invalid admin credentials' };
  }

  throttle.clear(key);

  const token = await createAdminToken(email);
  (await cookies()).set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CONFIG.admin.sessionTtlSeconds,
  });

  return { success: true };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    await revokeAdminToken(token);
    cookieStore.delete(ADMIN_COOKIE_NAME);
  }
  redirect('/admin/login');
}
