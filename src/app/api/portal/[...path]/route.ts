import { auth } from "@/src/lib/auth";
import { pool } from "@/src/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // backendApiKey is returned: false — must query DB directly
  const row = await pool.query<{ backendApiKey: string | null }>(
    'SELECT "backendApiKey" FROM "user" WHERE id = $1',
    [session.user.id]
  );

  const apiKey = row.rows[0]?.backendApiKey;

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
