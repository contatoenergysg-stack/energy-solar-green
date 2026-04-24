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
  const errors: string[] = [];
  try {
    errors.push("1. Iniciando processamento...");
    const data = (await req.json()) as OnboardingData;
    errors.push("2. Dados recebidos com sucesso");

    const templateKey = process.env.CLICKSIGN_TEMPLATE_KEY;
    if (!templateKey) {
      return NextResponse.json(
        { error: "CLICKSIGN_TEMPLATE_KEY não configurado.", steps: errors },
        { status: 500 }
      );
    }
    errors.push("3. Template key encontrado");

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
    errors.push("4. Dados de template preparados");

    errors.push("5. Criando documento a partir do template...");
    const doc = await createDocumentFromTemplate(templateKey, docPath, templateData);
    errors.push(`6. Documento criado: ${doc.key}`);

    errors.push("7. Criando assinante...");
    const signer = await createSigner({
      name: data.fullName || data.name,
      email: data.email,
      phone_number: normalizePhone(data.phone),
    });
    errors.push(`8. Assinante criado: ${signer.key}`);

    errors.push("9. Adicionando assinante ao documento...");
    const list = await addSignerToDocument(doc.key, signer.key);
    errors.push("10. Sucesso!");

    return NextResponse.json({
      documentKey: doc.key,
      requestSignatureKey: list.request_signature_key,
      widgetUrl: widgetUrl(list),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`ERRO: ${msg}`);
    if (err instanceof Error && err.stack) {
      errors.push(`Stack: ${err.stack}`);
    }
    console.error("[clicksign/create]", msg);
    return NextResponse.json(
      { error: msg, steps: errors },
      { status: 500 }
    );
  }
}
