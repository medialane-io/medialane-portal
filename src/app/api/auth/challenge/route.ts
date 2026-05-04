import { NextRequest, NextResponse } from "next/server";
import { generateNonce, buildTypedData } from "@/src/lib/siws";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
  }

  const nonce = await generateNonce(address);
  const typedData = buildTypedData(nonce, address);

  return NextResponse.json({ nonce, typedData });
}
