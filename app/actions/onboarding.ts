// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getDiscountPercent } from "@/lib/utils";
import type { OnboardingData } from "@/lib/onboarding-store";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
//
// Chamada por dois caminhos independentes — frontend pós-assinatura E webhook
// ZapSign. Idempotente via UNIQUE(zapsign_doc_token) ou UNIQUE(zapsign_external_id):
// se uma das chamadas perder a corrida, o INSERT retorna o registro já criado
// pela outra.
export async function submitOnboarding(
  formData: OnboardingData,
  meta?: {
    zapsignDocToken?: string;
    zapsignExternalId?: string;
    userId?: string | null;
  }
) {
  const admin = getAdminClient();

  let userId: string | null = meta?.userId ?? null;
  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  // Idempotência: se já existe subscription para este token, retorna ela.
  if (meta?.zapsignDocToken) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("zapsign_doc_token", meta.zapsignDocToken)
      .maybeSingle();
    if (existing) return { ok: true, subscriptionId: existing.id, alreadyExisted: true };
  }
  if (meta?.zapsignExternalId) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("zapsign_external_id", meta.zapsignExternalId)
      .maybeSingle();
    if (existing) return { ok: true, subscriptionId: existing.id, alreadyExisted: true };
  }

  // 1. Update profile only if authenticated
  if (userId) {
    await admin
      .from("profiles")
      .update({ name: formData.name, phone: formData.phone, cpf: formData.document })
      .eq("id", userId);
  }

  // 2. Create subscription via admin client (bypasses RLS)
  const { data: sub, error: subError } = await admin
    .from("subscriptions")
    .insert({
      user_id: userId,
      distributor: formData.distributor!,
      installation_number: formData.installationNumber || null,
      monthly_bill_brl: formData.monthlyBill,
      discount_percent: getDiscountPercent(formData.monthlyBill),
      status: "pending",
      contract_signed_at: formData.signed ? new Date().toISOString() : null,
      zapsign_doc_token: meta?.zapsignDocToken ?? null,
      zapsign_external_id: meta?.zapsignExternalId ?? null,
    })
    .select("id")
    .single();

  // Race condition: a outra chamada inseriu primeiro. Carrega e devolve.
  if (subError && (subError.code === "23505" || subError.message?.includes("duplicate"))) {
    if (meta?.zapsignDocToken) {
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id")
        .eq("zapsign_doc_token", meta.zapsignDocToken)
        .maybeSingle();
      if (existing) return { ok: true, subscriptionId: existing.id, alreadyExisted: true };
    }
  }

  if (subError || !sub) {
    console.error("[submitOnboarding] subscription", subError?.message);
    return { ok: false, error: subError?.message ?? "Erro ao criar assinatura." };
  }

  // 3. Create property via admin client
  await admin.from("properties").insert({
    user_id: userId,
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
    console.error("[sendEmailOtp] error:", error.message, error.status);
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("exceeded")) {
      return { ok: false, error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
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
