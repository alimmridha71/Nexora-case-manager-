# Nexora Law Firm — Agent & Contributor Guide

This document provides definitive guidance for AI coding agents (Claude, Gemini, GPT-4, Copilot) and human contributors working on the Nexora Law Firm project.

---

## 📁 Project Architecture & App Router Structure

Nexora Law Firm is a single **Next.js App Router application** (repository root):
1. **Application**: Full-stack Next.js web application utilizing React Server Components, Server Actions, Edge Middleware, and Supabase database isolation.

```
Nexora-Law-Firm/
├── (repository root)                  # Next.js App Router Application
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with fonts, metadata, Vibe96 verification
│   │   ├── page.tsx                   # Public homepage & hero presentation
│   │   ├── globals.css                # Global Tailwind CSS directives & color tokens
│   │   ├── practice-areas/
│   │   │   ├── page.tsx               # Practice areas directory
│   │   │   └── [slug]/page.tsx        # Dynamic individual practice area page
│   │   ├── attorneys/page.tsx         # Attorney roster & bios
│   │   ├── cases/page.tsx             # Public case status inquiry portal
│   │   ├── admin/
│   │   │   ├── page.tsx               # Role-gated admin case dashboard
│   │   │   └── login/page.tsx         # Admin authentication login
│   │   ├── actions/
│   │   │   ├── intake.ts              # Public consultation intake server action
│   │   │   ├── cases.ts               # Role-verified case management server actions
│   │   │   └── admin.ts               # Admin session authentication & cookie actions
│   │   └── api/
│   │       ├── intake/route.ts        # POST endpoint for consultation intake
│   │       └── admin/cases/route.ts   # Role-gated administrative case API
│   ├── components/
│   │   ├── Navbar.tsx                 # Responsive navigation bar
│   │   ├── Footer.tsx                 # Site footer with practice links & disclaimers
│   │   └── ContactForm.tsx            # Isolated public intake consultation form
│   ├── lib/
│   │   ├── supabase.ts                # Client & admin Supabase SDK initializers
│   │   ├── config.ts                  # Typed env + session/throttle settings (single source)
│   │   └── auth/                      # token.ts (sign/verify), password.ts (scrypt), revocation.ts, session.ts, index.ts
│   ├── middleware.ts                  # Edge middleware route guard for /admin/* (uses lib/auth/session)
│   ├── .env.example                   # Environment configuration template
│   ├── package.json                   # Pinned patched dependencies (Next.js, Supabase)
│   ├── package-lock.json              # Committed lockfile (0 audit vulnerabilities)
│   ├── tailwind.config.ts             # Tailwind CSS theme extension
│   ├── tsconfig.json                  # Strict TypeScript configuration
│   └── Dockerfile                     # Production Node.js 20 container image
├── database/
│   ├── schema.sql                     # Complete PostgreSQL DDL (tables, FKs, RLS, indexes)
│   └── seed.sql                       # Initial seed data (admin, attorneys, practices, demo)
├── docs/
│   ├── erd.md                         # Entity-Relationship Diagram & RLS policy notes
│   └── architecture.md                # System design & multi-layer architecture guide
├── .env.example                       # Root environment variable documentation
├── CHANGELOG.md                       # Version history starting at 1.0.0
├── HowToSetup.md                      # Deployment instructions (VPS, Docker, Cloud)
├── LICENSE-NOTE.md                    # Commercial licensing and third-party notices
├── docker-compose.yml                 # Multi-container orchestration (Next.js server)
└── Dockerfile                         # Next.js production runtime container
```

---

## 🛠️ Tech Stack & Pinned Dependencies

- **Framework**: Next.js 16.4.3 (App Router, Server Actions, Server Components)
- **UI Library**: React 19.3.1
- **Styling**: Tailwind CSS 3.4.14 + PostCSS 8.5.32
- **Icons**: Lucide React 0.453.0 & Lucide CDN for static previews
- **Database / Backend**: Supabase (`@supabase/supabase-js` 2.118.0)
- **Runtime**: Node.js >= 20.x

---

## 🔐 Security, Authorization & Intake Data Isolation

### 1. Data Isolation Model
- **Public Consultation Intake**: The `contacts` table allows `anon` role **INSERT ONLY**. Anonymous visitors can submit consultations, but cannot read, list, update, or delete records (no SELECT/UPDATE/DELETE policy exists for anon).
- **Role-Gated Mutations**: All modifications to `cases`, `hearings`, `documents`, and `contacts` require an authenticated session verified server-side.
- **Admin Verification (`lib/auth/`)**: Every server action calls `requireAdmin()` and every API route handler calls `verifyAdminSession()` as its first statement (middleware is a second layer, not the only one). `verifyToken` is the single verifier: HS256 signature + expiry, then the `revoked_tokens` lookup, which **fails closed** on any database error.
- **Revocation store**: `revoked_tokens` is read/written only with the server-side service-role client; RLS is on with no policies. Rows are purged on logout once expired.
- **Private tables have no RLS policies**: all private data is accessed server-side with the service-role key after the admin check. Only `contacts` (anon INSERT) and published site content (public SELECT) have policies.

### 2. Practice Content Location
- **Database Tables**: Practice areas are stored in `practice_areas` with indexed `slug`, `status`, and `created_at`.
- **Dynamic Routing**: Managed in `app/practice-areas/[slug]/page.tsx` with static fallback previews for Corporate, Trial, Intellectual Property, and Real Estate.
- **Attorney Profiles**: Stored in `attorneys` table and rendered via `app/attorneys/page.tsx`.

---

## 🎨 Tailwind CSS Conventions

- **Primary Colors**:
  - `primary-navy`: `#0A192F` (Deep institutional navy)
  - `primary-dark`: `#07101E` (Dark background)
  - `primary-light`: `#112240` (Card container fill)
  - `accent-gold`: `#D4AF37` (Legal prestige gold)
  - `accent-hover`: `#B5952F` (Interactive gold hover state)
- **Typography**:
  - Headings: Serif font (`Playfair Display`, `Georgia`, serif) for authority and elegance.
  - Body / UI: Clean sans-serif (`Inter`, system-ui, sans-serif) for legibility.
- **Component Classes**:
  - Buttons: `bg-[#D4AF37] hover:bg-[#B5952F] text-[#0A192F] font-semibold px-6 py-3 rounded transition-all`
  - Cards: `bg-[#112240] border border-slate-700/60 rounded-xl p-6 shadow-xl`
  - Form Inputs: `w-full bg-[#07101E] border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]`

---

## 🧪 Linting, Testing & Security Audits

### Next.js Application
```bash
# Navigate to Next.js project

# Run ESLint / Next lint
npm run lint

# Security audit check (ensures 0 vulnerabilities)
npm audit

# Production build verification
npm run build
```

---

## 🔑 Environment Variables

The project requires the following environment variables documented in `.env.example`:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Supabase Project URL (`https://your-project.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Supabase Anonymous Public API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Side Only | Administrative bypass key for server actions & seeding |
| `SESSION_SECRET` | Server-Side Only | Cryptographic secret for signing HMAC-SHA256 JWT sessions |
| `ADMIN_EMAIL` | Server-Side Only | Administrator login email (e.g. `admin@example.com`) |
| `ADMIN_PASSWORD_HASH` | Server-Side Only | Recommended: scrypt hash from `npm run hash-password` |
| `ADMIN_DEFAULT_PASSWORD` | Server-Side Only | Fallback plaintext password, used only when no hash is set |

---

## 👥 Administrator Setup & Access

In accordance with production security standards:
- **Admin Portal**: `/admin/login`
- **Administrator Email**: set via `ADMIN_EMAIL` (no default login exists)
- **Password**: Set `ADMIN_PASSWORD_HASH` (preferred) or `ADMIN_DEFAULT_PASSWORD` during deployment. Zero passwords exist in the codebase or documentation.

## 🛠️ Commands & Conventions

| Command | Purpose |
|---|---|
| `npm run lint` | Strict type check, fails on unused imports/variables |
| `npm test` | Auth unit tests (Node test runner + tsx) |
| `npm run audit:prod` | `npm audit --omit=dev` (last result: 0 vulnerabilities) |
| `npm run typecheck` | Plain type check |
| `npm run hash-password -- "<password>"` | Generate `ADMIN_PASSWORD_HASH` |

- Naming: files `kebab-case` or Next.js conventions, React components `PascalCase`, server actions end in `Action`, DB columns `snake_case`.
- Service-role client (`getServiceSupabase`) is server-only and may be used only after `requireAdmin()` / `verifyAdminSession()`.
- Linting is the strict TypeScript compiler (`npm run lint` fails on unused code); there is no ESLint toolchain, so there are no dev-tooling advisories or overrides.
