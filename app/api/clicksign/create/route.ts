"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  createDocumentFromTemplate,
  createSigner,
  addSignerToDocument,
  widgetUrl,
} from "@/lib/clicksign";
import { getDiscountPercent } from "@/lib/utils";
import type { OnboardingData } from "@/lib/onboarding-store";

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractCity(address: string): string {
  // Try "Rua X, 123, Bairro, Cidade - UF" or "... / CIDADE / UF"
  const slashParts = address.split("/");
  if (slashParts.length >= 2) {
    return slashParts[slashParts.length - 2].trim();
  }
  const commaParts = address.split(",");
  if (commaParts.length >= 3) {
    return commaParts[commaParts.length - 2].trim().replace(/-\s*\w+$/, "").trim();
  }
  return "Rio de Janeiro";
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as OnboardingData;

    const templateKey = process.env.CLICKSIGN_TEMPLATE_KEY;
    if (!templateKey) {
      return NextResponse.json(
        { error: "CLICKSIGN_TEMPLATE_KEY não configurado." },
        { status: 500 }
      );
    }

    const discount = (getDiscountPercent(data.monthlyBill) * 100).toFixed(0);
    const cpfDigits = data.document?.replace(/\D/g, "") ?? "";
    const docPath = `/contratos/${cpfDigits}-${Date.now()}.pdf`;

    const templateData: Record<string, string> = {
      desconto: discount,
      numero_uc: data.installationNumber ?? "",
      nome_completo: data.fullName || data.name,
      cpf: data.document ?? "",
      endereco: data.address ?? "",
      telefone: data.phone ?? "",
      email: data.email ?? "",
      whatsapp_cobranca: data.phone ?? "",
      email_cobranca: data.email ?? "",
      cidade: extractCity(data.address ?? ""),
      data_assinatura: formatDate(new Date()),
    };

    const doc = await createDocumentFromTemplate(templateKey, docPath, templateData);

    const signer = await createSigner({
      name: data.fullName || data.name,
      email: data.email,
      phone_number: normalizePhone(data.phone),
    });

    const list = await addSignerToDocument(doc.key, signer.key);

    return NextResponse.json({
      documentKey: doc.key,
      requestSignatureKey: list.request_signature_key,
      widgetUrl: widgetUrl(list),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[clicksign/create] ERRO DETALHADO:", msg);
    console.error("[clicksign/create] STACK:", err instanceof Error ? err.stack : "");
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
