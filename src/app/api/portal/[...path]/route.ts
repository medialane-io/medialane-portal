import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/src/lib/portal-session";

const apiUrl = process.env.MEDIALANE_API_URL;
const apiKey = process.env.MEDIALANE_API_KEY ?? "";

async function backendFetch(subpath: string, token: string, init?: RequestInit) {
  return rawFetch(`/v1/portal/${subpath}`, token, init);
}

async function rawFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    return await route(req, context);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("portal proxy failed", { message, stack: err instanceof Error ? err.stack : null });
    return NextResponse.json({ error: `Proxy failed: ${message}` }, { status: 500 });
  }
}

async function route(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
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
  const token = session.token;
  const [resource, id] = path;
  if (resource === "metadata" && path[1] === "upload-file" && req.method === "POST") {
    const upstream = await fetch(`${apiUrl}/v1/metadata/upload-file`, {
      method: "POST",
      headers: { "x-api-key": apiKey, Authorization: `Bearer ${token}` },
      body: await req.formData(),
    });
    const uploaded = await upstream.json().catch(() => null);
    return NextResponse.json(uploaded ?? {}, { status: upstream.status });
  }

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  if (resource === "credits" && !id && req.method === "GET") {
    const [me, history] = await Promise.all([
      backendFetch("me", token),
      backendFetch("credits/history", token),
    ]);
    if (me.status >= 400) return NextResponse.json(me.json ?? {}, { status: me.status });
    const balance = (me.json as { data?: { creditBalance?: number } })?.data?.creditBalance ?? 0;
    const historyRows = history.status < 400 ? (history.json as { data?: unknown[] })?.data ?? [] : [];
    return NextResponse.json({ data: { balance, history: historyRows } });
  }

  if (resource === "spend" && !id && req.method === "GET") {
    const upstream = await backendFetch("credits/spend", token);
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "usage" && !id && req.method === "GET") {
    const apiKeys = await backendFetch("keys", token);
    if (apiKeys.status >= 400) return NextResponse.json(apiKeys.json ?? {}, { status: apiKeys.status });
    return NextResponse.json({ data: { keys: (apiKeys.json as { data?: unknown[] })?.data ?? [] } });
  }

  if (resource === "paymaster") {
    const rest = path.slice(1).join("/");
    const allowed = ["deploy/build", "deploy/execute", "invoke/build", "invoke/execute"];
    if (!allowed.includes(rest)) {
      return NextResponse.json({ error: "Not allowed through this proxy" }, { status: 403 });
    }
    const upstream = await rawFetch(`/v1/paymaster/${rest}`, token, {
      method: req.method,
      body,
    });
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "pricing" && req.method === "GET") {
    const upstream = await rawFetch("/.well-known/x402", token);
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "prices" && req.method === "GET") {
    const upstream = await rawFetch("/v1/prices", token);
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "collections" && req.method === "GET") {
    const qs = new URLSearchParams({ chain: "STARKNET", owner: session.address, limit: "100" });
    const service = req.nextUrl.searchParams.get("service");
    if (service) qs.set("service", service);
    const upstream = await rawFetch(`/v1/collections?${qs.toString()}`, token);
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "intents") {
    const rest = path.slice(1).join("/");
    if (rest !== "create-tier" && rest !== "create-collection") {
      return NextResponse.json({ error: "Not allowed through this proxy" }, { status: 403 });
    }
    const upstream = await rawFetch(`/v1/intents/${rest}`, token, {
      method: req.method,
      body,
    });
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "issuance") {
    const rest = path.slice(1).join("/");
    if (rest !== "mint-calls") {
      return NextResponse.json({ error: "Not allowed through this proxy" }, { status: 403 });
    }
    const upstream = await rawFetch("/v1/business/issuance/mint-calls", token, {
      method: req.method,
      body,
    });
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "metadata") {
    const rest = path.slice(1).join("/");
    if (rest !== "upload" && rest !== "upload-file") {
      return NextResponse.json({ error: "Not allowed through this proxy" }, { status: 403 });
    }
    const upstream = await rawFetch("/v1/metadata/upload", token, {
      method: req.method,
      body,
    });
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  if (resource === "provisioning") {
    const rest = path.slice(1).join("/");
    const upstream = await rawFetch(
      `/v1/business/provisioning${rest ? `/${rest}` : ""}`,
      token,
      { method: req.method, body },
    );
    return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
  }

  const subpath = path.join("/");
  const upstream = await backendFetch(subpath, token, { method: req.method, body });
  return NextResponse.json(upstream.json ?? {}, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
