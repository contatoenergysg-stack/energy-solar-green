export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { unstable_noStore as noStore } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getDocument } from "@/lib/zapsign";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  noStore();
  try {
    const { key } = await params;
    const doc = await getDocument(key);
    return NextResponse.json(
      { status: doc.status ?? "unknown" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("[zapsign/status]", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
