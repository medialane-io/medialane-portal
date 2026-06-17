import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY!;
const API_URL = process.env.MEDIALANE_API_URL!;

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  if (path.some((seg) => seg === "" || seg === "." || seg === "..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const url = req.nextUrl;
  const safeParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (/^\$/.test(key) || /[{}]/.test(key)) return;
    safeParams.append(key, value);
  });
  const search = safeParams.toString() ? `?${safeParams.toString()}` : "";
  const targetUrl = `${API_URL}/admin/${path.join("/")}${search}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "x-api-key": ADMIN_API_KEY,
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
