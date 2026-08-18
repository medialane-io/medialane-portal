import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, clientIp } from "@/src/lib/rate-limit";

const checkRateLimit = createRateLimiter(60_000, 20);

export async function GET(req: NextRequest) {
  if (!checkRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiUrl || !apiKey) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  const res = await fetch(`${apiUrl}/v1/auth/siws/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ walletAddress: address }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.nonce || !json?.typedData) {
    return NextResponse.json({ error: "Failed to start sign-in" }, { status: 502 });
  }
  return NextResponse.json({ nonce: json.nonce, typedData: json.typedData });
}
