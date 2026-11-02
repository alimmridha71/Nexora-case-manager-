# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active support  |
| < 1.0   | ❌ Not supported   |

---

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in Nexora Law Firm, please **do not** open a public GitHub issue.

### How to Report

1. **Email**: Send a detailed report to `security@nexoralaw.com`
2. **Subject line**: `[SECURITY] Brief description of the vulnerability`
3. **Include in your report**:
   - Type of vulnerability (e.g., XSS, SQL injection, exposed credentials, broken auth)
   - File(s) and line(s) affected
   - Step-by-step instructions to reproduce
   - Potential impact assessment
   - Any suggested fix (optional but appreciated)

### What to Expect

- **Acknowledgement**: Within 48 hours of receiving your report
- **Assessment**: We will assess severity within 5 business days
- **Resolution**: We aim to patch critical vulnerabilities within 14 days
- **Disclosure**: We coordinate with you on responsible public disclosure

---

## Security Best Practices for Deployers

### Supabase Credentials
- **Never** commit real `SUPABASE_URL` or `SUPABASE_ANON_KEY` values to version control
- Add `.env` to `.gitignore` (already done in this project)
- Rotate your Supabase anon key immediately if accidentally exposed

### Row Level Security (RLS)
- Current RLS policies use `USING (true)` — acceptable for development only
- **Before production deployment**: Tighten RLS policies to restrict access by `auth.uid()`
  ```sql
  -- Example: restrict cases to the owning user
  CREATE POLICY "Users can only view own cases"
    ON public.cases FOR SELECT
    USING (auth.uid() = user_id::text::uuid);
  ```

### Password Storage
- The seed data uses plain-text placeholder passwords — **replace before deploying**
- In production, use Supabase Auth for proper password hashing (bcrypt)
- Never store plaintext passwords in the database

### Supabase Service Role Key
- The `SUPABASE_SERVICE_ROLE_KEY` in `.env.example` is for **server-side admin scripts only**
- Never embed the service role key in client-side HTML files
- It bypasses all RLS policies — treat it like a root password

### Content Security Policy
Consider adding CSP headers via `vercel.json` for production:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Dependency Security

This project has minimal dependencies since it is a zero-build static site:

| Dependency | Version | Source | CVE Status |
|------------|---------|--------|------------|
| Supabase JS Client | `2.x` (CDN) | jsDelivr | ✅ No known CVEs |
| Tailwind CSS | `3.x` (CDN) | jsDelivr | ✅ No known CVEs |
| Lucide Icons | `latest` (CDN) | jsDelivr | ✅ No known CVEs |
| Google Fonts | N/A | fonts.googleapis.com | ✅ No known CVEs |

All CDN resources are loaded from trusted providers. For production, consider pinning CDN URLs to specific versions.

## Authentication model (v1.0.6)
- Single administrator identified by `ADMIN_EMAIL`; password verified against `ADMIN_PASSWORD_HASH` (scrypt) or, as a fallback, `ADMIN_DEFAULT_PASSWORD`.
- Sessions are HS256 JWTs (8 h) in an HTTP-only, SameSite=Strict cookie, with a unique `jti` revoked on logout.
- Revocation lookups fail closed. Login is throttled (5 attempts / 15 min per IP + email).
- Every server action calls `requireAdmin()`; every API handler calls `verifyAdminSession()`.
- Report vulnerabilities privately to the contact in this file.

## Client portal (v1.1.0)
- Client sessions use a separate cookie and JWT role; they are rejected by every admin guard (covered by tests).
- Each client page checks the `client_case_access` list for the exact case id; unknown or unshared ids return 404.
- Client passwords are scrypt hashes. Temporary passwords are shown once to the admin and not stored in readable form.
- Notification emails never contain case details; details are shown only after sign-in.
