import { provisionWallet } from "@/src/lib/portal/provision";
import { withAuth } from "@/src/lib/with-auth";
import { NextResponse } from "next/server";

export const POST = withAuth(async (_req, session) => {
  const result = await provisionWallet({ address: session.address });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, alreadyProvisioned: result.alreadyProvisioned ?? false });
});
