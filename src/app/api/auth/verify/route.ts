import { NextRequest, NextResponse } from "next/server";
import { consumeNonce, verifySignature } from "@/src/lib/siws";
import { createSession, setSessionCookie } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

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

  // Signatures vary by wallet: Argent returns [r, s] (2 felts), Braavos returns
  // a longer array with a signer-type prefix. Felts may be hex (0x…) or decimal.
  // This is a cheap sanity guard only — the authoritative check is the on-chain
  // is_valid_signature call in verifySignature() below.
  if (
    signature.length < 1 ||
    signature.length > 32 ||
    !signature.every(
      (s: unknown) =>
        typeof s === "string" && /^(0x[0-9a-fA-F]+|[0-9]+)$/.test(s)
    )
  ) {
    return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
  }

  let normalizedAddress: string;
  try {
    normalizedAddress = normalizeStarknetAddress(address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const nonceValid = await consumeNonce(nonce, normalizedAddress);
  if (!nonceValid) {
    return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
  }

  let sigValid = false;
  try {
    sigValid = await verifySignature(normalizedAddress, nonce, signature);
  } catch (err) {
    console.error("[auth/verify] verifySignature threw:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Signature verification unavailable, try again" }, { status: 503 });
  }
  if (!sigValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Upsert account — creates row on first sign-in
  await pool.query(
    `INSERT INTO accounts (address) VALUES ($1) ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );

  const account = await pool.query<{ mdln_tier: number; is_admin: boolean }>(
    "SELECT mdln_tier, is_admin FROM accounts WHERE address = $1",
    [normalizedAddress]
  );
  const mdln_tier = account.rows[0]?.mdln_tier ?? 0;
  const is_admin = account.rows[0]?.is_admin ?? false;

  const { token } = await createSession({
    address: normalizedAddress,
    mdln_tier,
    is_admin,
  });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookie(response, token);
  return response;
}
