export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { submitOnboarding } from "@/app/actions/onboarding";
import type { OnboardingData } from "@/lib/onboarding-store";

interface WebhookPayload {
  token?: string;        // doc token
  status?: string;       // 'signed' | 'pending' | ...
  external_id?: string;  // nosso UUID
  event_type?: string;   // 'doc_signed' em algumas versões
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        // Evita o cache silencioso do Next sobre o fetch interno do supabase-js
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // Validação opcional via secret na query string
    const expectedSecret = process.env.ZAPSIGN_WEBHOOK_SECRET;
    if (expectedSecret) {
      const provided = req.nextUrl.searchParams.get("secret");
      if (provided !== expectedSecret) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    const payload = (await req.json()) as WebhookPayload;
    const status = (payload.status ?? "").toLowerCase();
    const eventType = (payload.event_type ?? "").toLowerCase();

    // Só processamos quando assinado
    const isSigned = status === "signed" || eventType === "doc_signed";
    if (!isSigned) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!payload.external_id) {
      console.warn("[zapsign/webhook] payload sem external_id", payload);
      return NextResponse.json({ error: "missing external_id" }, { status: 422 });
    }

    const admin = getAdminClient();

    // Idempotência rápida: se subscription já foi criada, sai.
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("zapsign_external_id", payload.external_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Recupera o payload de onboarding salvo em /api/zapsign/create
    const { data: draft, error: draftError } = await admin
      .from("onboarding_drafts")
      .select("data, user_id")
      .eq("session_id", payload.external_id)
      .maybeSingle();

    if (draftError || !draft) {
      console.error("[zapsign/webhook] draft não encontrado", payload.external_id, draftError);
      return NextResponse.json({ error: "draft not found" }, { status: 404 });
    }

    const formData = { ...(draft.data as OnboardingData), signed: true };
    const result = await submitOnboarding(formData, {
      zapsignDocToken: payload.token,
      zapsignExternalId: payload.external_id,
      userId: draft.user_id,
    });

    if (!result.ok) {
      console.error("[zapsign/webhook] submit failed", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, subscriptionId: result.subscriptionId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[zapsign/webhook]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
