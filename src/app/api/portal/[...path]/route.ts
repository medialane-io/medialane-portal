import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

/**
 * Portal proxy → backend Account-admin endpoints. Authorizes by the signed-in
 * session (carrying the AccountID), then calls the backend with the single portal
 * service secret, scoped to that account. No per-wallet key, no provisioning.
 *
 *   /api/portal/keys            → /admin/accounts/{accountId}/keys
 *   /api/portal/credits         → /admin/accounts/{accountId}/credits
 *   /api/portal/usage           → /admin/accounts/{accountId}/usage   (etc.)
 */
async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;
  if (!apiUrl || !apiSecret) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  }

  const { path } = await context.params;
  if (path.some((seg) => seg === ".." || seg === "." || seg.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const subpath = path.join("/");
  const upstreamUrl = `${apiUrl}/admin/accounts/${session.accountId}/${subpath}${req.nextUrl.search}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: { "x-api-key": apiSecret, "Content-Type": "application/json" },
    body,
  });

  const json = await upstream.json().catch(() => null);
  return NextResponse.json(json ?? {}, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
