// Run with: npm test   (Node's built-in test runner + tsx; no extra test framework)
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

before(() => {
  process.env.SESSION_SECRET = 'x'.repeat(40);
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_DEFAULT_PASSWORD = 'plain-fallback-password';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-placeholder';
});

const fakeClient = (result: { data: unknown; error: { message: string } | null }) =>
  (() => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => result }) }) }),
  })) as never;

describe('password verification', () => {
  it('verifies a scrypt hash and rejects a wrong password', async () => {
    const { hashPassword, verifyAdminPassword } = await import('../lib/auth/password');
    const hash = hashPassword('a-very-long-password');
    process.env.ADMIN_PASSWORD_HASH = hash;
    assert.ok(hash.startsWith('scrypt:'));
    assert.equal(verifyAdminPassword('a-very-long-password'), true);
    assert.equal(verifyAdminPassword('wrong-password'), false);
    delete process.env.ADMIN_PASSWORD_HASH;
  });

  it('falls back to the env password and compares without a length leak', async () => {
    const { verifyAdminPassword, safeEqual } = await import('../lib/auth/password');
    assert.equal(verifyAdminPassword('plain-fallback-password'), true);
    assert.equal(verifyAdminPassword('short'), false);
    assert.equal(safeEqual('abc', 'abcd'), false);
    assert.equal(safeEqual('abc', 'abc'), true);
  });
});

describe('admin tokens', () => {
  it('signs a token that verifies and carries a jti', async () => {
    const { createAdminToken, verifyTokenSignature } = await import('../lib/auth/token');
    const session = await verifyTokenSignature(await createAdminToken('Admin@Example.com'));
    assert.equal(session?.email, 'admin@example.com');
    assert.equal(session?.role, 'admin');
    assert.ok(session?.jti);
  });

  it('rejects tampered and malformed tokens', async () => {
    const { createAdminToken, verifyTokenSignature } = await import('../lib/auth/token');
    const token = await createAdminToken('admin@example.com');
    assert.equal(await verifyTokenSignature(token.slice(0, -2) + 'xx'), null);
    assert.equal(await verifyTokenSignature('not-a-jwt'), null);
  });
});

describe('revocation', () => {
  it('fails closed: a lookup error means the token is treated as revoked', async () => {
    const { isRevoked } = await import('../lib/auth/revocation');
    const original = console.error;
    console.error = () => {};
    assert.equal(await isRevoked('some-jti', fakeClient({ data: null, error: { message: 'db down' } })), true);
    console.error = original;
  });

  it('accepts a token that is not in the revocation table', async () => {
    const { isRevoked } = await import('../lib/auth/revocation');
    assert.equal(await isRevoked('fresh-jti', fakeClient({ data: null, error: null })), false);
  });

  it('rejects a token that is listed as revoked', async () => {
    const { isRevoked } = await import('../lib/auth/revocation');
    const row = { jti: 'gone-jti', expires_at: new Date(Date.now() + 60_000).toISOString() };
    assert.equal(await isRevoked('gone-jti', fakeClient({ data: row, error: null })), true);
  });
});
