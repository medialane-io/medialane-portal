import { type NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@medialane/sdk";
import { TRUSTED_APP_IP_HEADER, isSpoofableForwardingHeader, trustedClientIp } from "@/lib/client-ip";
import { hasTraversalSegment, isPathAllowed } from "./allowlist";
import { limiterFor } from "@/lib/rate-limit-policy";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  shouldSetSessionCookie,
  extractAccountToken,
  stripAccountToken,
  shouldInjectSessionCookie,
  injectAccountToken,
} from "./session-cookie";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL ?? "http://localhost:3001";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
]);

const checkRateLimit = limiterFor("proxy:backend");

async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed" },
      { status: 403 },
    );
  }

  const callerIp = trustedClientIp(req);
  if (!checkRateLimit(callerIp)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MEDIALANE_API_KEY is not configured on the server" },
      { status: 500 },
    );
  }

  const { path } = await ctx.params;
  const joinedPath = path.join("/");

  if (hasTraversalSegment(joinedPath)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!isPathAllowed(req.method, joinedPath)) {

    console.warn("[/api/proxy] blocked by allowlist", {
      method: req.method,
      path: joinedPath,
    });
    return NextResponse.json(
      { error: `Path not allowed through io proxy: ${req.method} /v1/${joinedPath}` },
      { status: 403 },
    );
  }

  const safePath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const target = `${BACKEND_URL.replace(/\/$/, "")}/v1/${safePath}${req.nextUrl.search}`;

  const fwdHeaders = new Headers();
  for (const [k, v] of req.headers.entries()) {
    const key = k.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(key) || key === "x-api-key") continue;
    if (isSpoofableForwardingHeader(key)) continue;
    fwdHeaders.set(k, v);
  }
  fwdHeaders.set("x-api-key", apiKey);
  fwdHeaders.set(TRUSTED_APP_IP_HEADER, callerIp);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const injectingCookie = shouldInjectSessionCookie(joinedPath, req.method);

  let body: BodyInit | undefined;
  if (hasBody && injectingCookie) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const bodyText = await req.text();
    body = sessionCookie ? injectAccountToken(bodyText, sessionCookie) : bodyText;
  } else if (hasBody) {
    body = await req.arrayBuffer();
  }

  const res = await fetch(target, {
    method: req.method,
    headers: fwdHeaders,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const outHeaders = new Headers();
  for (const [k, v] of res.headers.entries()) {
    const key = k.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(key) || key === "set-cookie") continue;
    outHeaders.set(k, v);
  }

  const settingCookie = res.ok && shouldSetSessionCookie(joinedPath, req.method);
  if (settingCookie) {
    const bodyText = await res.text();
    const accountToken = extractAccountToken(bodyText);
    const outBody = accountToken ? stripAccountToken(bodyText) : bodyText;
    const response = new NextResponse(outBody, {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
    });
    if (accountToken) {
      response.cookies.set(SESSION_COOKIE_NAME, accountToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      });
    }
    return response;
  }

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
