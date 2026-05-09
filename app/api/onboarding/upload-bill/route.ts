import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const BUCKET = "onboarding-files";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function safeFileName(name: string): string {
  // Remove caracteres problemáticos para o Storage e limita o tamanho.
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-120);
  return cleaned || "bill.pdf";
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sessão expirada. Verifique seu e-mail novamente." },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Arquivo grande demais (limite 15 MB)." },
        { status: 413 }
      );
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado (PDF, PNG ou JPEG)." },
        { status: 415 }
      );
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";
    const path = `${user.id}/bills/${randomUUID()}-${safeFileName(
      file.name || `bill.${ext}`
    )}`;

    const admin = getAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("[upload-bill]", error.message);
      return NextResponse.json(
        { error: "Não foi possível enviar o arquivo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ path });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload-bill]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
