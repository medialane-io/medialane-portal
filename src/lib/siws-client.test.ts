import { test, expect } from "bun:test";
import { requestSiwsToken } from "./siws-client";

test("a fresh signature asks only for a token, without registering an account or starting a session", async () => {
  const bodies: Record<string, unknown>[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body ?? "{}")));
    const payload = String(url).endsWith("/nonce") ? { nonce: "n1", typedData: {} } : { token: "t1" };
    return new Response(JSON.stringify(payload), { status: 200 });
  }) as typeof fetch;
  try {
    await requestSiwsToken({ walletAddress: "0x1", signer: { signMessage: async () => ["0x2", "0x3"] } }).catch(() => {});
  } finally {
    globalThis.fetch = original;
  }
  expect(bodies[1]).not.toHaveProperty("appSource");
});
