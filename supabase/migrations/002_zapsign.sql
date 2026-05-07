-- ZapSign integration: idempotency keys to prevent duplicate subscriptions
-- when both the client (submitOnboarding) and the webhook fire for the same signature.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS zapsign_doc_token TEXT,
  ADD COLUMN IF NOT EXISTS zapsign_external_id TEXT;

-- UNIQUE protects against double-insert race between webhook and client callback.
-- Partial index allows multiple NULLs for legacy rows that predate ZapSign.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_zapsign_doc_token
  ON public.subscriptions (zapsign_doc_token)
  WHERE zapsign_doc_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_zapsign_external_id
  ON public.subscriptions (zapsign_external_id)
  WHERE zapsign_external_id IS NOT NULL;
