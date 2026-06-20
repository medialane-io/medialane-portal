import { NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

// GET /api/auth/session — the current session (or null). Used by the client to
// know whether a wallet is signed in (the session cookie is HttpOnly).
export async function GET() {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ session: null });
  return NextResponse.json({
    session: { accountId: session.accountId, address: session.address, chain: session.chain, is_admin: session.is_admin },
  });
}
