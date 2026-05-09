import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["pedrochereghini@gmail.com"];
const BUCKET = "onboarding-files";
const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutos

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[admin/file]", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "failed to sign url" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
