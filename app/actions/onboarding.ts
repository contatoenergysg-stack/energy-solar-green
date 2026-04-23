"use server";

import { createClient } from "@/lib/supabase/server";
import { getDiscountPercent } from "@/lib/utils";
import type { OnboardingData } from "@/lib/onboarding-store";

// ── Save draft (called at each step) ──────────────────────
export async function saveDraft(
  sessionId: string,
  data: Partial<OnboardingData>,
  currentStep: number
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("onboarding_drafts")
    .upsert(
      {
        session_id: sessionId,
        user_id: user?.id ?? null,
        data: data as Record<string, unknown>,
        current_step: currentStep,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

  if (error) {
    console.error("[saveDraft]", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ── Load draft (for resume flow) ──────────────────────────
export async function loadDraft(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onboarding_drafts")
    .select("data, current_step")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("[loadDraft]", error.message);
    return null;
  }

  return data;
}

// ── Final submission (after signing) ──────────────────────
export async function submitOnboarding(formData: OnboardingData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Usuário não autenticado." };
  }

  // 1. Update profile
  await supabase
    .from("profiles")
    .update({ name: formData.name, phone: formData.phone, cpf: formData.document })
    .eq("id", user.id);

  // 2. Create subscription
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      distributor: formData.distributor!,
      installation_number: formData.installationNumber || null,
      monthly_bill_brl: formData.monthlyBill,
      discount_percent: getDiscountPercent(formData.monthlyBill),
      status: "pending",
      contract_signed_at: formData.signed ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (subError || !sub) {
    console.error("[submitOnboarding] subscription", subError?.message);
    return { ok: false, error: "Erro ao criar assinatura." };
  }

  // 3. Create property
  await supabase.from("properties").insert({
    user_id: user.id,
    subscription_id: sub.id,
    address: formData.address || null,
    titular_name: formData.fullName || formData.name,
    titular_cpf: formData.document || null,
    titular_rg: formData.rg || null,
    titular_civil_status: formData.civilStatus || null,
    titular_nationality: formData.nationality,
    titular_profession: formData.profession || null,
  });

  return { ok: true, subscriptionId: sub.id };
}

// ── Send email OTP (verification during onboarding) ──────
export async function sendEmailOtp(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ── Verify email OTP (authenticates the user) ────────────
export async function verifyEmailOtp(email: string, token: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
