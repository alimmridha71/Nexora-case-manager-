'use server';

// Client-portal authentication and notification actions (clients only; admin actions live elsewhere).
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createClientToken,
  CLIENT_COOKIE_NAME,
  revokeClientToken,
  requireClient,
  verifyPasswordHash,
  dummyPasswordCheck,
  createThrottle,
} from '@/lib/auth';
import { CONFIG } from '@/lib/config';
import { getServiceSupabase } from '@/lib/supabase';

const throttle = createThrottle();

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(200),
});

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export async function clientLoginAction(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email')?.toString() || '',
    password: formData.get('password')?.toString() || '',
  });
  if (!parsed.success) return { success: false, error: 'Please enter your email and password.' };
  const { email, password } = parsed.data;

  const key = `${await clientIp()}|${email}`;
  const lockedFor = throttle.lockedMinutes(key);
  if (lockedFor > 0) {
    return { success: false, error: `Too many failed attempts. Please retry after ${lockedFor} minutes.` };
  }

  const supabase = getServiceSupabase();
  const { data: client, error } = await supabase
    .from('client_accounts')
    .select('client_id, email, password_hash, is_active')
    .ilike('email', email)
    .maybeSingle();

  if (error) {
    console.error('Client login lookup failed:', error.message);
    return { success: false, error: 'Sign-in is temporarily unavailable. Please try again later.' };
  }

  const valid = client ? verifyPasswordHash(password, client.password_hash) : (dummyPasswordCheck(password), false);
  if (!client || !valid || !client.is_active) {
    throttle.fail(key);
    return { success: false, error: 'Invalid email or password.' };
  }

  throttle.clear(key);
  await supabase.from('client_accounts').update({ last_login_at: new Date().toISOString() }).eq('client_id', client.client_id);

  const token = await createClientToken(client.client_id, client.email);
  (await cookies()).set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CONFIG.client.sessionTtlSeconds,
  });
  return { success: true };
}

export async function clientLogoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;
  if (token) {
    await revokeClientToken(token);
    cookieStore.delete(CLIENT_COOKIE_NAME);
  }
  redirect('/client/login');
}

/** Mark all of the signed-in client's notifications as read. */
export async function markNotificationsReadAction(): Promise<{ success: boolean }> {
  const session = await requireClient();
  const { error } = await getServiceSupabase()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('client_id', session.clientId)
    .is('read_at', null);
  return { success: !error };
}
