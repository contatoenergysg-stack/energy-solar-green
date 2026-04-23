import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client placeholder. Configure envs when wiring dashboard:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Suggested schema for futura área do cliente (Dashboard):
 *
 *   users (id uuid pk, email, name, phone, cpf, created_at)
 *   subscriptions (id, user_id fk, distributor, installation_number,
 *                  monthly_bill_brl numeric, discount_percent numeric,
 *                  status enum, starts_at, contract_url)
 *   invoices (id, subscription_id fk, reference_month date,
 *             kwh_consumed numeric, amount_brl numeric, amount_saved_brl numeric,
 *             due_date, paid_at, status enum, pdf_url)
 *   properties (id, user_id fk, address, titular_name, titular_cpf,
 *               titular_rg, titular_civil_status, energy_bill_pdf_url)
 *
 * Every onboarding step writes to the `onboarding_drafts` table
 * keyed by session id, so the user can resume later.
 */

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _client;
}

export const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
