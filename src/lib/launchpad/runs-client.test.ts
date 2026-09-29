import { expect, test } from "bun:test";
import { createRunsClient } from "./runs-client";

function recordingFetch() {
  const bodies: unknown[] = [];
  const urls: string[] = [];
  const impl = (async (input: unknown, init?: RequestInit) => {
    urls.push(String(input));
    bodies.push(init?.body === undefined ? undefined : JSON.parse(String(init.body)));
    return new Response(JSON.stringify({ data: { id: "run1", status: "PAID" } }), { status: 200 });
  }) as unknown as typeof fetch;
  return { impl, bodies, urls };
}

test("paying a run from a settled top-up sends the intent, never a transaction hash", async () => {
  const { impl, bodies, urls } = recordingFetch();
  await createRunsClient(() => null, impl).checkoutFromWallet("run1", "fi_123");
  expect(urls[0]).toBe("/api/proxy/v1/portal/runs/run1/checkout");
  expect(bodies[0]).toEqual({ method: "wallet", intentId: "fi_123" });
});

test("paying from credits is unchanged", async () => {
  const { impl, bodies } = recordingFetch();
  await createRunsClient(() => null, impl).checkoutWithCredits("run1");
  expect(bodies[0]).toEqual({ method: "credits" });
});
