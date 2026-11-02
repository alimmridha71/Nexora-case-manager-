# CLAUDE.md — Architecture & Working Guide

Guide for AI assistants and developers working on **Nexora Case Manager** (case management and client portal for law firms). `AGENTS.md` holds the same rules in an agent-neutral format; keep both in sync.

## What this app is
Next.js 16 App Router + Supabase (PostgreSQL, Storage). Two audiences, two separate sessions:
- **Staff (admin)**: `/admin/*` — case register, timelines, client accounts, files.
- **Clients**: `/client/*` — see only the cases shared with them, timeline, shared documents, notifications.
- **Public**: demo firm pages, consultation intake (`anon` INSERT only) and a case-status lookup (`/cases`).

## Commands
| Command | Purpose |
|---|---|
| `npm ci` | install exactly what `package-lock.json` pins |
| `npm run dev` / `npm run build` / `npm start` | develop / production build / serve |
| `npm run lint` | strict type check; fails on unused code (no ESLint toolchain) |
| `npm run typecheck` | plain type check |
| `npm test` | unit tests (Node test runner + tsx) |
| `npm run audit:prod` | `npm audit --omit=dev` |
| `npm run hash-password -- "<pw>"` | create `ADMIN_PASSWORD_HASH` |
| `npm run seed-demo` | set the demo client's password (see `scripts/seed-demo.mjs`) |

## Layout
```
app/
  admin/            staff pages (cases, cases/[caseId], clients, login)
  client/           client pages (login, portal, cases/[caseId])
  api/              intake, admin/cases, files/[fileId] (signed downloads)
  actions/          server actions: admin, cases, clients, client, events, files, intake
components/         ActionForm (runs a server action + shows result), Navbar, Footer, ContactForm,
                    home/ProductHome (landing page) and home/FirmHome (firm site home)
lib/
  auth/             token.ts (JWT), password.ts (scrypt), revocation.ts, session.ts, throttle.ts
  config.ts         ALL environment access and tunables (session TTL, limits, branding)
  supabase.ts       anon client (browser-safe) and service-role client (server only)
  cases-service.ts  case create/update/delete/list (shared by actions and REST)
  notify.ts         notifications (+ optional Resend email)   files.ts / storage.ts  uploads
  brand.ts          brand colors -> CSS variables              client-data.ts  ownership checks
database/           schema.sql, seed.sql, migrations/001..003
tests/              auth.test.ts, portal.test.ts
```

## Rules that must not be broken
1. **Every** admin server action calls `requireAdmin()` and every admin API handler calls `verifyAdminSession()` first. Middleware is an extra layer, never the only one.
2. Client pages/handlers must call `requireClient()` **and** `clientCanSeeCase(clientId, caseId)`; unknown or unshared ids return 404.
3. The service-role client (`getServiceSupabase`) is server-only and used only after an auth check. Never import it into a client component.
4. All tables have RLS enabled. Private tables have **no policies** (service role only). Only `contacts` (anon INSERT) and published site content have policies.
5. Token verification fails closed: if `revoked_tokens` cannot be read, the session is invalid.
6. Notification emails stay generic. Case details are shown only after sign-in.
7. No secrets or demo passwords in the repository; configuration comes from environment variables (`.env.example`).
8. `'use server'` files may export async functions only; put constants in `lib/`.

## Conventions
- TypeScript strict; validate all external input with `zod`.
- Files `kebab-case`, components `PascalCase`, server actions end in `Action`, DB columns `snake_case`.
- Database changes ship as a new `database/migrations/00N_*.sql` (idempotent, additive) **and** in `schema.sql`.
- Status values are `active` / `inactive` (database CHECK constraint).
- Keep files under ~300 lines; reuse `lib/ui.ts` class strings and `ActionForm`.

## Adding a feature (checklist)
1. Migration + `schema.sql` (+ `docs/erd.md`). 2. Server action with `zod` + auth guard. 3. Page. 4. Test the pure logic in `tests/`. 5. `npm run lint && npm test && npm run build`. 6. Update `CHANGELOG.md` and `docs/api.md`.
