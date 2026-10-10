import { afterEach, beforeEach, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const realFetch = globalThis.fetch;
let forwarded: Headers | undefined;

beforeEach(() => {
  process.env.MEDIALANE_API_KEY = "test-key";
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    forwarded = new Headers(init?.headers);
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  forwarded = undefined;
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
