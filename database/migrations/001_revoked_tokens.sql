-- ==============================================================================
-- Migration 001 — session revocation store (run on an EXISTING database)
-- Safe to run more than once. Adds ONLY the revoked_tokens table; touches no other table.
-- RUN THIS BEFORE DEPLOYING v1.0.6: the app now fails closed if this table is missing.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
    jti         VARCHAR(100) PRIMARY KEY,
    revoked_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON public.revoked_tokens(expires_at);

-- RLS on, and NO policies: only the service-role key (server-side) can read or write.
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow reading revoked tokens"   ON public.revoked_tokens;
DROP POLICY IF EXISTS "Allow recording revoked tokens" ON public.revoked_tokens;

CREATE OR REPLACE FUNCTION public.purge_expired_revoked_tokens()
RETURNS void LANGUAGE sql AS $$ DELETE FROM public.revoked_tokens WHERE expires_at < now(); $$;
