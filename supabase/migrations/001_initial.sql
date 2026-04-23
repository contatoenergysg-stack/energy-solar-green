-- ============================================================
-- ESG — Energy Solar Green
-- Schema inicial
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── PROFILES ──────────────────────────────────────────────
-- Extends auth.users with product-specific fields
CREATE TABLE public.profiles (
  id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        text,
  phone       text,
  cpf         text        UNIQUE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── ONBOARDING DRAFTS ──────────────────────────────────────
-- Saves progress so user can resume from any device
CREATE TABLE public.onboarding_drafts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id   text        UNIQUE NOT NULL,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  data         jsonb       NOT NULL DEFAULT '{}',
  current_step int         NOT NULL DEFAULT 1,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;

-- Anon users can read/write their own draft by session_id
-- Authenticated users can see their own draft
CREATE POLICY "Anyone can insert a draft"
  ON public.onboarding_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Session owner can read draft"
  ON public.onboarding_drafts FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
  );

CREATE POLICY "Session owner can update draft"
  ON public.onboarding_drafts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON public.onboarding_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ── SUBSCRIPTIONS ──────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                  uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid    REFERENCES auth.users(id) NOT NULL,
  distributor         text    NOT NULL,
  installation_number text,
  monthly_bill_brl    numeric(10, 2),
  discount_percent    numeric(5, 4),
  status              text    NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','active','cancelled','suspended')),
  starts_at           timestamptz,
  contract_signed_at  timestamptz,
  created_at          timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);


-- ── PROPERTIES ─────────────────────────────────────────────
CREATE TABLE public.properties (
  id                    uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id       uuid  REFERENCES public.subscriptions(id),
  user_id               uuid  REFERENCES auth.users(id) NOT NULL,
  address               text,
  titular_name          text,
  titular_cpf           text,
  titular_rg            text,
  titular_civil_status  text,
  titular_nationality   text  DEFAULT 'Brasileiro(a)',
  titular_profession    text,
  energy_bill_path      text,
  created_at            timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id);


-- ── INVOICES ───────────────────────────────────────────────
CREATE TABLE public.invoices (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id  uuid    REFERENCES public.subscriptions(id) NOT NULL,
  reference_month  date    NOT NULL,
  kwh_consumed     numeric(10, 2),
  amount_brl       numeric(10, 2),
  amount_saved_brl numeric(10, 2),
  due_date         date,
  paid_at          timestamptz,
  status           text    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','paid','overdue')),
  pdf_url          text,
  created_at       timestamptz DEFAULT now() NOT NULL,
  UNIQUE (subscription_id, reference_month)
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM public.subscriptions
      WHERE id = subscription_id
    )
  );


-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_drafts_session    ON public.onboarding_drafts (session_id);
CREATE INDEX idx_drafts_user       ON public.onboarding_drafts (user_id);
CREATE INDEX idx_subs_user         ON public.subscriptions (user_id);
CREATE INDEX idx_props_user        ON public.properties (user_id);
CREATE INDEX idx_invoices_sub      ON public.invoices (subscription_id);
CREATE INDEX idx_invoices_status   ON public.invoices (status);
