import { afterEach, beforeEach, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const realFetch = globalThis.fetch;
let calls: Array<{ url: string; headers: Headers }> = [];
let backend: () => Response;

beforeEach(() => {
  process.env.MEDIALANE_API_KEY = "test-key";
  calls = [];
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    calls.push({ url: String(url), headers: new Headers(init?.headers) });
    return backend();
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const withCookie = () => {
  const req = new NextRequest("http://localhost/api/session");
  req.cookies.set("ml_account_session", "acct-123");
  return req;
};

test("no session cookie is signed out, without calling the backend", async () => {
  const res = await GET(new NextRequest("http://localhost/api/session"));
  expect(res.status).toBe(200);
  expect(await res.json()).toBeNull();
  expect(calls).toHaveLength(0);
});

test("a valid session returns the account, asked with the app's key and the session", async () => {
  const session = { accountId: "acc_1", publicId: "p1", walletAddress: null, email: "a@example.com", emailDeadline: null };
  backend = () => Response.json(session);
  const res = await GET(withCookie());
  expect(await res.json()).toEqual(session);
  expect(calls[0]!.url).toEndWith("/v1/users/me");
  expect(calls[0]!.headers.get("x-account-session")).toBe("acct-123");
  expect(calls[0]!.headers.get("x-api-key")).toBe("test-key");
  expect(calls[0]!.headers.get("x-app-id")).toBe("MEDIALANE_PORTAL");
});

test("an expired or inactive session is signed out and the cookie is cleared", async () => {
  for (const status of [401, 403]) {
    backend = () => Response.json({ error: "x" }, { status });
    const res = await GET(withCookie());
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
    expect(res.headers.get("set-cookie")).toContain("ml_account_session=;");
  }
});

test("a backend failure is reported as a failure, not as signed out", async () => {
  backend = () => Response.json({ error: "down" }, { status: 503 });
  const res = await GET(withCookie());
  expect(res.status).toBe(502);
});
