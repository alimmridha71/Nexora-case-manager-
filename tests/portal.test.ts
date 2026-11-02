import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

before(() => {
  process.env.SESSION_SECRET = 'y'.repeat(40);
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_DEFAULT_PASSWORD = 'plain-fallback-password';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-placeholder';
});

describe('role separation between admin and client tokens', () => {
  it('a client token is never accepted as an admin session', async () => {
    const { createClientToken, verifyTokenSignature, verifyClientTokenSignature } = await import('../lib/auth/token');
    const token = await createClientToken(7, 'Client@Example.com');
    assert.equal(await verifyTokenSignature(token), null);
    const session = await verifyClientTokenSignature(token);
    assert.equal(session?.clientId, 7);
    assert.equal(session?.email, 'client@example.com');
    assert.equal(session?.role, 'client');
    assert.ok(session?.jti);
  });

  it('an admin token is never accepted as a client session', async () => {
    const { createAdminToken, verifyClientTokenSignature } = await import('../lib/auth/token');
    assert.equal(await verifyClientTokenSignature(await createAdminToken('admin@example.com')), null);
  });
});

describe('temporary passwords and hashing', () => {
  it('generates distinct, long passwords that verify against their hash', async () => {
    const { generateTemporaryPassword, hashPassword, verifyPasswordHash, dummyPasswordCheck } = await import('../lib/auth/password');
    const a = generateTemporaryPassword();
    const b = generateTemporaryPassword();
    assert.notEqual(a, b);
    assert.ok(a.length >= 16);
    const hash = hashPassword(a);
    assert.equal(verifyPasswordHash(a, hash), true);
    assert.equal(verifyPasswordHash(b, hash), false);
    assert.equal(verifyPasswordHash(a, 'not-a-hash'), false);
    assert.doesNotThrow(() => dummyPasswordCheck('anything'));
  });
});

describe('login throttle', () => {
  it('locks a key after the maximum failures and unlocks after the window', async () => {
    const { createThrottle } = await import('../lib/auth/throttle');
    let t = 1_000_000;
    const throttle = createThrottle(() => t);
    for (let i = 0; i < 5; i++) throttle.fail('ip|a@b.c');
    assert.ok(throttle.lockedMinutes('ip|a@b.c') > 0);
    assert.equal(throttle.lockedMinutes('other|key'), 0);
    t += 16 * 60 * 1000;
    assert.equal(throttle.lockedMinutes('ip|a@b.c'), 0);
  });

  it('clear() removes the failure count', async () => {
    const { createThrottle } = await import('../lib/auth/throttle');
    const throttle = createThrottle();
    for (let i = 0; i < 5; i++) throttle.fail('k');
    throttle.clear('k');
    assert.equal(throttle.lockedMinutes('k'), 0);
  });
});

describe('notification email text', () => {
  it('stays generic: it names the case number but never any case details', async () => {
    const { buildEmailText } = await import('../lib/notify');
    const mail = buildEmailText('Example Firm', 'EX-001', 'https://example.com/');
    assert.ok(mail.subject.includes('EX-001'));
    assert.ok(mail.text.includes('https://example.com/client'));
    assert.ok(!mail.text.includes('//client'));
  });
});

describe('brand colors', () => {
  it('converts hex to rgb triplets, with a safe fallback for bad input', async () => {
    const { hexToRgb, brandCssVars } = await import('../lib/brand');
    assert.deepEqual(hexToRgb('#ff8000', [0, 0, 0]), [255, 128, 0]);
    assert.deepEqual(hexToRgb('not-a-color', [1, 2, 3]), [1, 2, 3]);
    const vars = brandCssVars('#102030', '#c5a059');
    assert.equal(vars['--c-burgundy'], '16 32 48');
    assert.equal(vars['--c-gold'], '197 160 89');
  });
});

describe('case file upload rules', () => {
  it('accepts allowed types and rejects wrong, oversized and empty files', async () => {
    const { validateUpload, MAX_FILE_BYTES } = await import('../lib/files');
    assert.equal(validateUpload('brief.pdf', 'application/pdf', 1000), null);
    assert.equal(validateUpload('photo.JPG', 'image/jpeg', 1000), null);
    assert.ok(validateUpload('virus.exe', 'application/x-msdownload', 1000));
    assert.ok(validateUpload('brief.pdf', 'image/png', 1000), 'extension must match the declared type');
    assert.ok(validateUpload('big.pdf', 'application/pdf', MAX_FILE_BYTES + 1));
    assert.ok(validateUpload('empty.pdf', 'application/pdf', 0));
    assert.ok(validateUpload('', 'application/pdf', 10));
  });

  it('builds storage paths that cannot escape the case folder', async () => {
    const { safeFileName, buildStoragePath } = await import('../lib/files');
    assert.equal(safeFileName('../../etc/passwd'), 'passwd');
    assert.equal(safeFileName('my brief (final).pdf'), 'my_brief_final_.pdf');
    assert.equal(safeFileName('...'), 'file');
    assert.equal(buildStoragePath(12, 'abc', '../x y.pdf'), 'cases/12/abc-x_y.pdf');
  });
});

describe('case service validation', () => {
  it('requires the essential fields and rejects bad ids', async () => {
    const { CreateCaseSchema, UpdateCaseSchema, CaseIdSchema } = await import('../lib/cases-service');
    const ok = CreateCaseSchema.safeParse({ case_no: 'EX-1', plaintiff_name: 'Ada', defendants_name: 'Bob', court_id: '2', case_type_id: 1, client_mobile: '+1-800-555-0100' });
    assert.equal(ok.success, true);
    assert.equal(ok.success && ok.data.court_id, 2);
    assert.equal(CreateCaseSchema.safeParse({ case_no: 'EX-1', plaintiff_name: 'Ada', defendants_name: 'Bob', court_id: 1, case_type_id: 1 }).success, false, 'mobile is required');
    assert.equal(CaseIdSchema.safeParse('0').success, false);
    assert.equal(CaseIdSchema.safeParse('abc').success, false);
    assert.equal(CaseIdSchema.safeParse('15').success, true);
    assert.equal(UpdateCaseSchema.safeParse({ case_id: 1 }).success, false, 'nothing to update');
    assert.equal(UpdateCaseSchema.safeParse({ case_id: 1, status: 'pending' }).success, false, 'status is active or inactive');
    assert.equal(UpdateCaseSchema.safeParse({ case_id: 1, status: 'inactive' }).success, true);
  });
});
