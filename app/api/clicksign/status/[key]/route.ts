"use server";

import { NextRequest, NextResponse } from "next/server";
import { getDocumentStatus } from "@/lib/clicksign";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const doc = await getDocumentStatus(key);
    return NextResponse.json({ status: doc.status });
  } catch (err) {
    console.error("[clicksign/status]", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
