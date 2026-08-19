import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

const apiUrl = process.env.MEDIALANE_API_URL;

async function backendFetch(subpath: string, apiKey: string, init?: RequestInit) {
  const res = await fetch(`${apiUrl}/v1/portal/${subpath}`, {
    ...init,
    headers: { "x-api-key": apiKey, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!apiUrl) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  }

  const { path } = await context.params;
  if (path.some((seg) => seg === ".." || seg === "." || seg.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const [resource, id] = path;
  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  // The frontend's /api/portal/{credits,usage} views predate /v1/portal's shape —
  // adapt them here rather than reshaping the real self-service API for two callers.
  if (resource === "credits" && !id && req.method === "GET") {
    const [me, history] = await Promise.all([
      backendFetch("me", session.apiKey),
      backendFetch("credits/history", session.apiKey),
    ]);
    if (me.status >= 400) return NextResponse.json(me.json ?? {}, { status: me.status });
    const balance = (me.json as { data?: { creditBalance?: number } })?.data?.creditBalance ?? 0;
    const historyRows = history.status < 400 ? (history.json as { data?: unknown[] })?.data ?? [] : [];
    return NextResponse.json({ data: { balance, history: historyRows } });
  }

  if (resource === "usage" && !id && req.method === "GET") {
    const keys = await backendFetch("keys", session.apiKey);
    if (keys.status >= 400) return NextResponse.json(keys.json ?? {}, { status: keys.status });
    return NextResponse.json({ data: { keys: (keys.json as { data?: unknown[] })?.data ?? [] } });
  }

  const subpath = path.join("/");
  const upstream = await backendFetch(subpath, session.apiKey, { method: req.method, body });
  return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
