import { provisionWallet } from "@/src/lib/portal/provision";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }
  const result = await provisionWallet({ address });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, alreadyProvisioned: result.alreadyProvisioned ?? false });
}
