import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/challenge?address=0x... — proxy the backend's proven SIWS nonce.
// The portal does NOT build its own challenge or verify signatures; it reuses the
// exact handshake the dapp uses in production (works with Braavos/Argent).
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const apiUrl = process.env.MEDIALANE_API_URL;
  if (!apiUrl) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  const res = await fetch(`${apiUrl}/v1/auth/siws/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: address }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.nonce || !json?.typedData) {
    return NextResponse.json({ error: "Failed to start sign-in" }, { status: 502 });
  }
  return NextResponse.json({ nonce: json.nonce, typedData: json.typedData });
}
