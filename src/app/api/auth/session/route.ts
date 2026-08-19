import { NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

export async function GET() {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ session: null });
  return NextResponse.json({
    session: { accountId: session.accountId, address: session.address, chain: session.chain },
  });
}
