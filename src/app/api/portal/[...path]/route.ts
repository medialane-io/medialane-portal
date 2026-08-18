import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

interface AdminAccount {
  id: string;
  apiClient: { id: string } | null;
}

async function resolveApiClientId(apiUrl: string, apiSecret: string, accountId: string): Promise<string | null> {
  const headers = { "x-api-key": apiSecret, "Content-Type": "application/json" };

  const lookup = await fetch(`${apiUrl}/admin/accounts?q=${encodeURIComponent(accountId)}`, { headers });
  const lookupJson = (await lookup.json().catch(() => null)) as { data?: AdminAccount[] } | null;
  const existing = lookupJson?.data?.find((a) => a.id === accountId)?.apiClient;
  if (existing) return existing.id;

  const created = await fetch(`${apiUrl}/admin/api-clients`, {
    method: "POST",
    headers,
    body: JSON.stringify({ accountId }),
  });
  if (created.status === 201) {
    const createdJson = (await created.json().catch(() => null)) as { data?: { id: string } } | null;
    return createdJson?.data?.id ?? null;
  }
  if (created.status === 409) {
    // Lost a create race — someone else provisioned it between our lookup and our create.
    const retry = await fetch(`${apiUrl}/admin/accounts?q=${encodeURIComponent(accountId)}`, { headers });
    const retryJson = (await retry.json().catch(() => null)) as { data?: AdminAccount[] } | null;
    return retryJson?.data?.find((a) => a.id === accountId)?.apiClient?.id ?? null;
  }
  return null;
}

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

  const apiClientId = await resolveApiClientId(apiUrl, apiSecret, session.accountId);
  if (!apiClientId) {
    return NextResponse.json({ error: "Could not resolve or provision an API client for this account" }, { status: 502 });
  }

  const subpath = path.join("/");
  const upstreamUrl = `${apiUrl}/admin/api-clients/${apiClientId}/${subpath}${req.nextUrl.search}`;

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
