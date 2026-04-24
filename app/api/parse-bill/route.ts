"use server";

import { NextRequest, NextResponse } from "next/server";
import { parseBillText } from "@/lib/parsers/bill";
import { pathToFileURL } from "url";
import { resolve } from "path";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerPath = resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const doc = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = content.items.map((item: any) => item.str ?? "").join(" ");
      text += pageText + "\n";
    }
    await doc.destroy();

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
