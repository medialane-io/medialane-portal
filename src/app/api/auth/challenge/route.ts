import { NextRequest, NextResponse } from "next/server";
import { generateNonce, buildTypedData } from "@/src/lib/siws";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("address");
    let address: string;
    try {
      address = normalizeStarknetAddress(raw ?? "");
    } catch {
      return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
    }

    const nonce = await generateNonce(address);
    const typedData = buildTypedData(nonce, address);

    return NextResponse.json({ nonce, typedData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[auth/challenge]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
