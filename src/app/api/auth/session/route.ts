import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/src/lib/session-edge";
import { createSession, setSessionCookie } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

// Read the current session from the auth-token cookie.
export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await verifyTokenEdge(token);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({
    ok: true,
    address: session.address,
    is_admin: session.is_admin,
    mdln_tier: session.mdln_tier,
  });
}

// Establish a session for a connected wallet. Connect-only, like the dapp — no
// signature. The address is taken from the connected wallet; the portal mints a
// short-lived session cookie so its dashboard/proxy routes can resolve "who".
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawAddress = body?.address;

  let address: string;
  try {
    address = normalizeStarknetAddress(typeof rawAddress === "string" ? rawAddress : "");
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    // Upsert the account row on first connect, then read its flags.
    await pool.query(
      `INSERT INTO accounts (address) VALUES ($1) ON CONFLICT (address) DO NOTHING`,
      [address]
    );
    const account = await pool.query<{ mdln_tier: number; is_admin: boolean }>(
      "SELECT mdln_tier, is_admin FROM accounts WHERE address = $1",
      [address]
    );
    const mdln_tier = account.rows[0]?.mdln_tier ?? 0;
    const is_admin = account.rows[0]?.is_admin ?? false;

    const { token } = await createSession({ address, mdln_tier, is_admin });

    const response = NextResponse.json({ ok: true, address, is_admin, mdln_tier });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[auth/session POST] failed:", detail);
    return NextResponse.json({ error: "Could not establish session", detail }, { status: 500 });
  }
}
