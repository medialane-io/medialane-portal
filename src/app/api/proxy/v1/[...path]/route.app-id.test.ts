import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { NextRequest } from "next/server";

type Handler = (req: Request, ctx: { params: Promise<{ path: string[] }> }) => Promise<Response>;

const realFetch = globalThis.fetch;
let forwarded: Headers | undefined;
let forwardedUrl: string | undefined;
let GET: Handler;
let POST: Handler;

beforeAll(async () => {
  process.env.MEDIALANE_API_KEY = "test-key";
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    forwardedUrl = String(url);
    forwarded = new Headers(init?.headers);
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  ({ GET, POST } = await import("./route"));
});

beforeEach(() => {
  forwarded = undefined;
});

afterAll(() => {
  globalThis.fetch = realFetch;
});

test("the proxy names its app and ignores an app id sent by the browser", async () => {
  const req = new NextRequest("http://localhost/api/proxy/v1/prices", { headers: { "x-app-id": "MEDIALANE_DAO" } });
  const res = await GET(req, { params: Promise.resolve({ path: ["prices"] }) });
  expect(res.status).toBe(200);
  expect(forwarded?.get("x-app-id")).toBe("MEDIALANE_PORTAL");
  expect(forwarded?.get("x-api-key")).toBe("test-key");
});

test("the proxy forwards the account session cookie as x-account-session on every request", async () => {
  const req = new NextRequest("http://localhost/api/proxy/v1/users/me");
  req.cookies.set("ml_account_session", "acct-123");
  await GET(req, { params: Promise.resolve({ path: ["users", "me"] }) });
  expect(forwarded?.get("x-account-session")).toBe("acct-123");
});

test("the proxy ignores an x-account-session header sent by the browser", async () => {
  const req = new NextRequest("http://localhost/api/proxy/v1/users/me", { headers: { "x-account-session": "forged" } });
  await GET(req, { params: Promise.resolve({ path: ["users", "me"] }) });
  expect(forwarded?.has("x-account-session")).toBe(false);
});

test("portal routes, rpc and paymaster calls carry the session, never a bearer header", async () => {
  for (const path of [["portal", "keys"], ["rpc"], ["paymaster", "invoke", "build"], ["paymaster", "deploy", "execute"]]) {
    const req = new NextRequest(`http://localhost/api/proxy/v1/${path.join("/")}`, { method: "POST", body: "{}" });
    req.cookies.set("ml_account_session", "s1");
    const res = await POST(req, { params: Promise.resolve({ path }) });
    expect(res.status).toBe(200);
    expect(forwardedUrl).toEndWith(`/v1/${path.join("/")}`);
    expect(forwarded?.get("x-account-session")).toBe("s1");
    expect(forwarded?.has("authorization")).toBe(false);
  }
});
