import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MEDIALANE_API_URL!;

const FORWARD_HEADERS = [
  "x-ml-admin-grant", "x-ml-admin-sig", "x-ml-admin-nonce", "x-ml-admin-ts", "content-type",
];

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path.some((seg) => seg === "" || seg === "." || seg === "..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const target = `${API_URL}/admin/${path.join("/")}${req.nextUrl.search}`;
  const forward = new Headers();
  for (const h of FORWARD_HEADERS) {
    const v = req.headers.get(h); if (v) forward.set(h, v);
  }
  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;
  const upstream = await fetch(target, { method: req.method, headers: forward, body });
  const text = await upstream.text();
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
