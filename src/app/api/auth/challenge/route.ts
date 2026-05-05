import { NextRequest, NextResponse } from "next/server";
import { generateNonce, buildTypedData } from "@/src/lib/siws";
import { checkRateLimit } from "@/src/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await checkRateLimit(`challenge:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const address = req.nextUrl.searchParams.get("address");
  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
  }

  const nonce = await generateNonce(address);
  const typedData = buildTypedData(nonce, address);

  return NextResponse.json({ nonce, typedData });
}
