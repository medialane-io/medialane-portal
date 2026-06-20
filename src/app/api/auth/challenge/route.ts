import { NextRequest, NextResponse } from "next/server";
import { generateNonce, buildTypedData } from "@/src/lib/portal-siws";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

// GET /api/auth/challenge?address=0x... — issue a sign-in nonce + typed data.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("address");
  if (!raw) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  let address: string;
  try {
    address = normalizeStarknetAddress(raw);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const nonce = await generateNonce(address);
  return NextResponse.json({ nonce, typedData: buildTypedData(nonce, address) });
}
