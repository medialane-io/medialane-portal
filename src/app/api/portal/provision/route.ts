import { getSession } from "@/src/lib/session";
import { provisionWallet } from "@/src/lib/portal/provision";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await provisionWallet({ address: session.address });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    alreadyProvisioned: result.alreadyProvisioned ?? false,
  });
}
