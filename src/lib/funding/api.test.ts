import { afterEach, expect, mock, test } from "bun:test";
import { portalFundingApi } from "./api";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

test("funding calls go through the portal proxy with the Media Wallet token", async () => {
  const seen: { url: string; auth: string | undefined }[] = [];
  globalThis.fetch = mock(async (input: unknown, init?: RequestInit) => {
    seen.push({ url: String(input), auth: (init?.headers as Record<string, string> | undefined)?.Authorization });
    return new Response(JSON.stringify({ data: { id: "fi1", method: "chain-transfer", status: "PENDING", expiresAt: "x" } }), { status: 201 });
  }) as unknown as typeof fetch;

  await portalFundingApi("media-wallet-token").createFunding({ method: "chain-transfer", params: { amountUsdc: "5" } });

  expect(seen[0]!.url).toBe("/api/proxy/v1/portal/funding");
  expect(seen[0]!.auth).toBe("Bearer media-wallet-token");
});

test("with no token it sends no Authorization header, so the session cookie decides", async () => {
  const seen: (string | undefined)[] = [];
  globalThis.fetch = mock(async (_input: unknown, init?: RequestInit) => {
    seen.push((init?.headers as Record<string, string> | undefined)?.Authorization);
    return new Response(JSON.stringify({ data: { id: "fi1", method: "chain-transfer", status: "PENDING", expiresAt: "x" } }), { status: 201 });
  }) as unknown as typeof fetch;

  await portalFundingApi(null).createFunding({ method: "chain-transfer", params: { amountUsdc: "5" } });
  expect(seen[0]).toBeUndefined();
});

test("a token other than USDC is passed to the top-up, and USDC sends nothing extra", async () => {
  const bodies: unknown[] = [];
  globalThis.fetch = mock(async (_input: unknown, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ data: { id: "fi1", method: "chain-transfer", status: "PENDING", expiresAt: "x" } }), { status: 201 });
  }) as unknown as typeof fetch;

  await portalFundingApi("t", "ETH").createFunding({ method: "chain-transfer", params: { amountUsdc: "5" } });
  await portalFundingApi("t", "USDC").createFunding({ method: "chain-transfer", params: { amountUsdc: "5" } });
  await portalFundingApi("t").createFunding({ method: "chain-transfer", params: { amountUsdc: "5" } });

  expect(bodies[0]).toEqual({ method: "chain-transfer", params: { amountUsdc: "5", asset: "ETH" } });
  expect(bodies[1]).toEqual({ method: "chain-transfer", params: { amountUsdc: "5" } });
  expect(bodies[2]).toEqual({ method: "chain-transfer", params: { amountUsdc: "5" } });
});
