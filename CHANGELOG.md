# Changelog

All notable changes to the Nexora Law Firm project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 1.3.1

- Login: admin and client sign-in actions never throw; a server misconfiguration now shows an error message instead of a form stuck on "Authenticating...".
- Login pages: `try/finally` handling, no prefilled admin email, safe same-site `redirect` handling, autocomplete attributes.
- Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP) and `no-store` caching on `/admin` and `/client`; `X-Powered-By` removed.
- Added `.gitignore` (blocks `.env*` and secret notes) and `.env.example`.

## [1.3.0] — 2026-11-02

### Added
- Product landing page at `/` (features, how it works, security, what is included, live-demo entry points); `HOME_MODE=firm` switches back to the firm's public home page.

### Changed
- Case logic now lives in one service (`lib/cases-service.ts`) used by both the server actions and the REST handlers; the REST API no longer hard-codes the owner id, never returns raw database errors, and shares validation with the actions.
- Footer/contact details, legal name and office hours come from configuration instead of source code.
- Removed the unused ESLint toolchain (and the package override it needed); `npm run lint` is now the strict TypeScript compiler and fails on unused code. Dependencies updated within their major versions (jose, lucide-react, tailwindcss, typescript, autoprefixer, @types/node).
- Removed the superseded "document link" form; documents are uploaded as files.

---

## [1.2.0] — 2026-10-31

### Added
- **Case file uploads** to a private Supabase Storage bucket (PDF, PNG, JPG, TXT, DOCX, max 4 MB) with per-file client visibility, optional client notification and 60-second signed downloads (`/api/files/[fileId]`).
- Migration `003_case_files.sql`; stored files are removed when a case is deleted.
- Seed data: demo timeline, demo client, case access and notification; `npm run seed-demo` sets the demo client password without storing it in the repository.
- Full `CLAUDE.md` architecture guide; README feature-to-code map.
- 2 more unit tests (16 total).

---

## [1.1.0] — 2026-10-30

### Added
- **Client portal** (`/client`): separate client accounts and sessions, access limited to explicitly shared cases.
- **Case timeline**: staff add hearings/orders/notes per case and choose what clients can see.
- **Notifications**: stored in the portal on every status change or notified timeline entry; optional email via Resend with generic text.
- **Admin screens**: `/admin/cases` (register + create), `/admin/cases/[id]` (status, timeline, client access, documents), `/admin/clients` (create, reset password, deactivate).
- **Configurable branding** through environment variables (name, subtitle, tagline, brand colors).
- Migration `002_client_portal.sql`; 7 additional unit tests (14 total).

### Changed
- Product positioned as case management software; the website pages are demo content.
- Case creation derives the owner from the selected court instead of a hard-coded user id.
- Fixed dead links to removed static pages (`cases.html`).

---

## [1.0.6] — 2026-10-29

### Security
- Split `lib/auth.ts` into `lib/auth/{token,password,revocation,session}.ts`; middleware imports only the edge-safe session module.
- Revocation now uses the service-role client, is bounded in memory, purges expired rows and **fails closed** on database errors.
- Admin password supports a scrypt hash (`ADMIN_PASSWORD_HASH`); constant-time comparison no longer leaks length.
- RLS: `revoked_tokens` has no anon policies; removed `USING (true)` / `authenticated` policies on private tables; anon intake is INSERT-only with a CHECK.
- Login throttle keyed by IP + email; session TTL, cookie name and limits moved to `lib/config.ts`.
- Intake endpoints no longer leak database error messages or report fake success on failure.

### Added
- `database/migrations/001_revoked_tokens.sql`, `scripts/hash-password.mjs`, auth unit tests (`npm test`), `npm run audit:prod`, CI test + audit steps.

### Removed
- Unused duplicate case action aliases and hard-coded `uploaded_by` / file size values.

---

## [1.0.3] — 2026-10-28

### Changed
- `database/schema.sql`: `cases` table now mirrors the live production structure (`case_no`, `plaintiff_name`, `client_mobile`, ...); removed `case_number`, `title`, `client_name`, `client_email` alias columns and the sync trigger.
- `status` is limited to `active` / `inactive` everywhere (schema, server actions, API, docs).
- `/cases` inquiry: exact `case_no` match (no raw filter string), verification by full mobile number only.
- Removed published demo passwords and hard-coded admin emails; `ADMIN_EMAIL` is now required.
- `database/seed.sql`: demo case `NEX-2026-001` uses real columns and is idempotent.

---

## [1.0.0] — 2026-10-26

### Added
- **Next.js app (repository root)** — Production Next.js 16 App Router application:
  - Role-gated admin dashboard (`/admin`) and secure authentication (`/admin/login`)
  - Server actions for public consultation intake (`app/actions/intake.ts`) and role-verified mutations (`app/actions/cases.ts`)
  - Edge middleware protecting administrative routes (`middleware.ts`)
  - Dynamic practice area routes (`/practice-areas/[slug]`) and attorney directory (`/attorneys`)
  - Pinned zero-vulnerability dependencies in `package-lock.json`
- **`index.html`** — Full-featured luxury law firm landing page with:
  - High-conversion hero section with animated background
  - Practice area showcase (Corporate, Criminal, Family, Property law)
  - Attorney roster with profile cards
  - AI rulebook briefings section
  - Client testimonials carousel
  - Consultation inquiry form connected to Supabase `contacts` table
  - Supabase client portal login modal
- **`cases.html`** — Authenticated case management dashboard:
  - Full CRUD for cases, courts, case types, and assistants
  - Hearing date tracking and order details
  - Document vault with Supabase Storage integration
  - Subscription plan enforcement
  - Print-ready case reports
- **Practice & Legal Pages**:
  - `accelerator.html` — Corporate growth & acquisition practice landing page
  - `odegard.html` — Trial & personal injury practice landing page
  - `service-terms.html` — Hosting & support terms of service
  - `license.html` — Commercial licensing terms
  - `seller-agreement.html` — Marketplace and vendor agreement
  - `privacy.html` — Data protection & GDPR-aligned privacy policy
- **Database Architecture & Supabase Engine**:
  - `database/schema.sql` — PostgreSQL DDL with `practice_areas`, `attorneys`, `site_content`, `cases`, `users`, and strict role-based RLS
  - `database/seed.sql` — Seed data with demo admin placeholder (`admin@example.com`), attorneys, and sample practice areas
  - `supabase-setup.sql` — Automated one-step database provisioner
- **Architecture & Setup Documentation**:
  - `docs/erd.md` — Entity Relationship Diagram and table schema documentation
  - `docs/architecture.md` — Dual-layer system architecture overview
  - `HowToSetup.md` — Step-by-step installation for VPS and Docker targets
  - `LICENSE-NOTE.md` — Commercial licensing terms for buyers and third-party components
  - `CLAUDE.md` & `AGENTS.md` — AI assistant instructions and coding conventions
- **Containerization**:
  - `Dockerfile` & `docker-compose.yml` — Production Node.js 20 container running Next.js application server with health checks

### Security & Privacy
- Row Level Security (RLS) enabled across 100% of tables with strict intake isolation (`anon` INSERT only on `contacts`; all mutations restricted to authenticated `admin`).
- Zero hardcoded production credentials in codebase; all sensitive secrets managed via environment variables.

---

## [Unreleased]

### Planned
- Automated SMS and calendar sync for courtroom hearing dates
- Multilingual client consultation intake (English, Spanish, French)
- End-to-end encrypted document sharing for attorney-client privilege
