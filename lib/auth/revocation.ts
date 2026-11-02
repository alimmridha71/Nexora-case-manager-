// Session revocation store: bounded in-memory cache in front of the `revoked_tokens` table.
// Uses the server-only service-role client. Reads FAIL CLOSED: if the lookup errors, the token is
// treated as revoked so a database outage can never keep a logged-out session alive.
import { getServiceSupabase } from '../supabase';

type ClientFactory = typeof getServiceSupabase;

const MAX_CACHE_ENTRIES = 1000;
const cache = new Map<string, number>(); // jti -> expiry (ms epoch)

function remember(jti: string, expiresAtMs: number): void {
  const now = Date.now();
  for (const [key, exp] of cache) {
    if (exp <= now) cache.delete(key);
  }
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.set(jti, expiresAtMs);
}

/** Persist a revocation. Returns false (and logs) if the database write failed. */
export async function revokeJti(jti: string, expSeconds?: number): Promise<boolean> {
  const expiresAtMs = expSeconds ? expSeconds * 1000 : Date.now() + 8 * 60 * 60 * 1000;
  remember(jti, expiresAtMs);

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('revoked_tokens')
    .upsert([{ jti, revoked_at: new Date().toISOString(), expires_at: new Date(expiresAtMs).toISOString() }], {
      onConflict: 'jti',
    });
  if (error) {
    console.error('revoked_tokens write failed:', error.message);
    return false;
  }

  // Housekeeping: drop rows for tokens that have already expired anyway.
  await supabase.from('revoked_tokens').delete().lt('expires_at', new Date().toISOString());
  return true;
}

/** True if the token was revoked OR the lookup failed (fail closed). */
export async function isRevoked(jti: string, getClient: ClientFactory = getServiceSupabase): Promise<boolean> {
  const cached = cache.get(jti);
  if (cached !== undefined && cached > Date.now()) return true;

  try {
    const { data, error } = await getClient()
      .from('revoked_tokens')
      .select('jti, expires_at')
      .eq('jti', jti)
      .maybeSingle();
    if (error) {
      console.error('revoked_tokens lookup failed (failing closed):', error.message);
      return true;
    }
    if (data?.jti) {
      remember(jti, data.expires_at ? Date.parse(data.expires_at) : Date.now() + 8 * 60 * 60 * 1000);
      return true;
    }
    return false;
  } catch (err) {
    console.error('revoked_tokens lookup threw (failing closed):', err);
    return true;
  }
}
