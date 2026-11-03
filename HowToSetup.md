# Setup & Installation Guide - Nexora Law Firm

Two deployment targets are supported: **A) Vercel + Supabase** and **B) Docker**.
Demo credentials are not stored in this repository; they are provided in the buyer datasheet.

## Prerequisites
- Node.js >= 20.9.0 (see `.nvmrc`)
- A Supabase project

## Step 1: Database (both targets)
**New project (empty database):**
1. Create a project at https://supabase.com
2. SQL Editor -> run `database/schema.sql`, which creates all 19 tables, indexes, and Row Level Security policies.
3. SQL Editor -> run `database/seed.sql` to populate sample practice areas, attorneys, courts, and initial demo data.
4. Storage -> create a bucket named `case-documents` (private) for client document vaults.
5. Seed demo client: run `npm run seed-demo` (creates `demo.client@example.com` with seeded case access).

**Existing database (upgrading):** run these in order **before deploying** (each is safe to repeat and only adds new tables):
1. `database/migrations/001_revoked_tokens.sql` — session revocation store. The app fails closed, so admin login will not work until this table exists.
2. `database/migrations/002_client_portal.sql` — client accounts, case access, case timeline, notifications.
3. `database/migrations/003_case_files.sql` — case file uploads (the private storage bucket is created automatically on the first upload).

## Custom Branding & White-Labeling
Nexora Law Firm includes custom white-label capabilities via environment variables:
- **`FIRM_NAME`**: Legal firm corporate name.
- **`FIRM_SHORT_NAME`**: Short header brand name.
- **`BRAND_PRIMARY_COLOR`**: Primary color token (hex, e.g. `#6b1d2f` for Burgundy).
- **`BRAND_ACCENT_COLOR`**: Accent color token (hex, e.g. `#c5a059` for Gold).
- **`HOME_MODE`**: `firm` to present the legal advisory homepage, or `product` to present the software case-manager product landing page.

## Step 2: Environment variables

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase -> Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | never expose to the browser |
| `SESSION_SECRET` | server only | min 32 chars: `openssl rand -base64 32` |
| `ADMIN_EMAIL` | server only | admin login email |
| `HOME_MODE` | server only | `product` (default): software landing page at `/`; `firm`: the firm's own public site |
| `FIRM_NAME`, `FIRM_SHORT_NAME`, `FIRM_SUBTITLE`, `FIRM_TAGLINE` | server only | branding text (defaults provided) |
| `BRAND_PRIMARY_COLOR`, `BRAND_ACCENT_COLOR` | server only | hex colors, e.g. `#6b1d2f` |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | server only | optional: email delivery of notifications |
| `ADMIN_PASSWORD_HASH` | server only | recommended: `npm run hash-password -- "your long password"` |
| `ADMIN_DEFAULT_PASSWORD` | server only | fallback plaintext, used only if no hash is set |
| `NEXT_PUBLIC_SITE_URL` | public | e.g. `https://your-site.vercel.app` |
| `NEXT_PUBLIC_STORAGE_BUCKET` | public | default `case-documents` |

## Target A: Vercel
1. Import the repository in Vercel (framework: Next.js, root directory: repository root).
2. Add the variables above under Settings -> Environment Variables.
3. Deploy.

## Target B: Docker
1. `cp .env.example .env` and fill in the values.
2. `docker compose up -d --build`
3. Open http://localhost:3000

## Local development
```bash
cp .env.example .env.local
npm ci
npm run dev
```

## Verify the build
```bash
npm ci
npm run lint          # strict type check (no unused code)
npm test              # 16 unit tests (auth, roles, throttle, notifications, branding, uploads)
npm run audit:prod    # npm audit --omit=dev -> 0 vulnerabilities (checked on release 1.0.6)
npm run build
```
Do not include `node_modules/` or `.next/` when archiving; `package-lock.json` must stay in the project root.

## First-time walkthrough
1. Sign in at `/admin/login`.
2. **Clients** -> create a client account; copy the temporary password shown once.
3. **Cases** -> open a case (or use the seeded `NEX-2026-001`); under *Client access* grant the client.
4. Add a timeline entry with *Visible to client* and *Notify client* ticked.
5. Sign in at `/client` as that client: the case, its timeline and the notification appear. Other clients cannot see it.

## Seed the demo client (optional, for demos and reviews)
After `schema.sql` + `seed.sql`, set a password for the demo client (`demo.client@example.com`) from your own machine:
```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DEMO_CLIENT_PASSWORD='a long password' npm run seed-demo
```
Then sign in at `/client`. Put that password in your datasheet, not in the repository.

## Demo access
Demo credentials are provided in the buyer datasheet, never in this repository.
Admin login: `/admin/login`. Client portal demo: `/cases` with case number `NEX-2026-001` and the registered mobile number.
