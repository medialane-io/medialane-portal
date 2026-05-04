import { NextRequest, NextResponse } from "next/server";
import { consumeNonce, verifySignature } from "@/src/lib/siws";
import { createSession, setSessionCookies } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { address, nonce, signature } = body ?? {};

  if (
    typeof address !== "string" ||
    typeof nonce !== "string" ||
    !Array.isArray(signature)
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const normalizedAddress = address.toLowerCase();

  const nonceValid = await consumeNonce(nonce, normalizedAddress);
  if (!nonceValid) {
    return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
  }

  const sigValid = await verifySignature(normalizedAddress, nonce, signature);
  if (!sigValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Upsert wallet — creates account on first sign-in
  await pool.query(
    `INSERT INTO wallets (address) VALUES ($1) ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );
  await pool.query(
    `INSERT INTO credits (address) VALUES ($1) ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );

  const wallet = await pool.query<{ mdln_tier: number }>(
    "SELECT mdln_tier FROM wallets WHERE address = $1",
    [normalizedAddress]
  );
  const mdln_tier = wallet.rows[0]?.mdln_tier ?? 0;

  const { token, refreshToken } = await createSession({ address: normalizedAddress, mdln_tier });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookies(response, token, refreshToken);
  return response;
}
