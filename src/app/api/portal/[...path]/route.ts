import { pool } from "@/src/lib/db";
import { getSession } from "@/src/lib/session";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM accounts WHERE address = $1",
    [session.address]
  );

  const apiKey = row.rows[0]?.backend_api_key;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key — provision first" },
      { status: 403 }
    );
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  }

  const { path } = await params;

  if (path.some((seg) => seg === ".." || seg === "." || seg.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const subpath = path.join("/");
  const search = req.nextUrl.search;
  const upstreamUrl = `${apiUrl}/v1/portal/${subpath}${search}`;

  const reqHeaders: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: reqHeaders,
    body,
  });

  const json = await upstream.json().catch(() => null);
  return NextResponse.json(json ?? {}, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
