import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { provisionUser } from "@/src/lib/portal/provision";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await provisionUser({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  if (!result.ok) {
    const status = result.error === "User has no email" ? 400 : 502;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    alreadyProvisioned: result.alreadyProvisioned ?? false,
  });
}
