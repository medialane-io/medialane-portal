import { expect, test } from "bun:test";
import {
  createRunsClient,
  ticketingBase,
  ticketingBatchBase,
  ticketingCollectionBase,
  ticketingTierBase,
} from "./runs-client";

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

test("ticketing steps are called under the run's ticketing path", async () => {
  const { impl, bodies, urls } = recordingFetch();
  const client = createRunsClient(() => null, impl);

  await client.ticketing.uploadUrl("run1", "a.png");
  await client.ticketing.uploaded("run1", "a.png", "bafy-cid-123456");
  await client.ticketing.metadata("run1", "0xowner");
  await client.ticketing.resolveWallets("run1");
  await client.ticketing.registerWallet("run1", {
    recipient: "ana@x.com",
    interimOwnerPubkey: "0x1",
    derivationSalt: "s".repeat(16),
    deployment: { typedData: {}, signature: ["0x1"], deployment: {} },
  });
  await client.ticketing.buildWallet("run1", { ownerPubkey: "0x1", ownerAddress: "0x2" });
  await client.ticketing.confirmCollection("run1");
  await client.ticketing.confirmTier("run1");
  await client.ticketing.confirmBatch("run1", 2);

  const base = "/api/proxy/v1/portal/runs/run1/ticketing";
  expect(urls).toEqual([
    `${base}/files/upload-url`,
    `${base}/files/uploaded`,
    `${base}/metadata`,
    `${base}/wallets/resolve`,
    `${base}/wallets`,
    `${base}/wallets/build`,
    `${base}/collection/confirm`,
    `${base}/tier/confirm`,
    `${base}/batches/2/confirm`,
  ]);
  expect(bodies[0]).toEqual({ name: "a.png" });
  expect(bodies[2]).toEqual({ userAddress: "0xowner" });
});

test("ticketing bases are the ones the sponsored signer posts to", () => {
  expect(ticketingBase("run1")).toBe("/api/proxy/v1/portal/runs/run1/ticketing");
  expect(ticketingCollectionBase("run1")).toBe("/api/proxy/v1/portal/runs/run1/ticketing/collection");
  expect(ticketingTierBase("run1")).toBe("/api/proxy/v1/portal/runs/run1/ticketing/tier");
  expect(ticketingBatchBase("run1", 3)).toBe("/api/proxy/v1/portal/runs/run1/ticketing/batches/3");
});
