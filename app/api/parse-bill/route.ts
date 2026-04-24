"use server";

import { NextRequest, NextResponse } from "next/server";
import { parseBillText } from "@/lib/parsers/bill";
import { PDFParse } from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const text = textResult.text;
    await parser.destroy();

    const result = parseBillText(text);

    if (!result) {
      return NextResponse.json(
        { error: "Não foi possível extrair os dados da conta. Verifique se é um PDF de conta de energia." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[parse-bill]", message);
    return NextResponse.json(
      { error: `Erro ao processar: ${message}` },
      { status: 500 }
    );
  }
}
