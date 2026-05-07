import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createDocFromTemplate, widgetUrl } from "@/lib/zapsign";
import { getDiscountPercent } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { OnboardingData } from "@/lib/onboarding-store";

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractCity(address: string): string {
  const slashParts = address.split("/");
  if (slashParts.length >= 2) return slashParts[slashParts.length - 2].trim();
  const commaParts = address.split(",");
  if (commaParts.length >= 3) {
    return commaParts[commaParts.length - 2].trim().replace(/-\s*\w+$/, "").trim();
  }
  return "Rio de Janeiro";
}

function normalizePhoneDigits(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const steps: string[] = [];
  try {
    const data = (await req.json()) as OnboardingData;
    steps.push("1. Dados recebidos");

    const templateId = process.env.ZAPSIGN_TEMPLATE_ID;
    if (!templateId) {
      return NextResponse.json(
        { error: "ZAPSIGN_TEMPLATE_ID não configurado.", steps },
        { status: 500 }
      );
    }

    const externalId = randomUUID();
    steps.push(`2. external_id gerado: ${externalId}`);

    // Persiste o payload ANTES de criar o doc, para o webhook conseguir
    // recuperar e finalizar a inscrição mesmo se o cliente fechar o browser.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = getAdminClient();

    const { error: draftError } = await admin
      .from("onboarding_drafts")
      .upsert(
        {
          session_id: externalId,
          user_id: user?.id ?? null,
          data: data as unknown as Record<string, unknown>,
          current_step: 9,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      );

    if (draftError) {
      console.error("[zapsign/create] draft persist", draftError);
      return NextResponse.json(
        { error: "Falha ao salvar dados antes da assinatura.", steps },
        { status: 500 }
      );
    }
    steps.push("3. Payload persistido em onboarding_drafts");

    const discount = (getDiscountPercent(data.monthlyBill) * 100).toFixed(0);
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

    const templateVars = [
      { de: "{{desconto}}", para: discount },
      { de: "{{numero_uc}}", para: data.installationNumber ?? "" },
      { de: "{{nome_completo}}", para: data.fullName || data.name },
      { de: "{{cpf}}", para: data.document ?? "" },
      { de: "{{endereco}}", para: data.address ?? "" },
      { de: "{{telefone}}", para: data.phone ?? "" },
      { de: "{{email}}", para: data.email ?? "" },
      { de: "{{whatsapp_cobranca}}", para: data.phone ?? "" },
      { de: "{{email_cobranca}}", para: data.email ?? "" },
      { de: "{{cidade}}", para: extractCity(data.address ?? "") },
      { de: "{{data_assinatura}}", para: formatDate(new Date()) },
    ];

    steps.push("4. Criando documento na ZapSign...");
    const doc = await createDocFromTemplate({
      template_id: templateId,
      signer_name: data.fullName || data.name,
      signer_email: data.email,
      signer_phone: normalizePhoneDigits(data.phone),
      external_id: externalId,
      redirect_url: `${appUrl}/onboarding/sucesso`,
      data: templateVars,
    });
    steps.push(`5. Documento criado: ${doc.token}`);

    const signer = doc.signers?.[0];
    if (!signer?.token) {
      return NextResponse.json(
        { error: "ZapSign não retornou signatário.", steps },
        { status: 502 }
      );
    }

    return NextResponse.json({
      documentKey: doc.token,
      signerKey: signer.token,
      widgetUrl: widgetUrl(signer.token),
      externalId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[zapsign/create]", msg);
    return NextResponse.json({ error: msg, steps }, { status: 500 });
  }
}
