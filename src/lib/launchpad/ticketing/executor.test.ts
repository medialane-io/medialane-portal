import { describe, expect, test } from "bun:test";
import { executeTicketingRun, type TicketingExecutorDeps, type TicketingEvent } from "./executor";
import { MissingFilesError, StillConfirmingError } from "@/lib/launchpad/engine";
import type { LaunchpadRun, TicketingNextStep } from "@medialane/sdk";

const artwork = new File(["x"], "a.png", { type: "image/png" });

function backend(steps: TicketingNextStep[], options: { pending?: string[]; polls?: number } = {}) {
  const calls: string[] = [];
  let i = 0;
  let polls = options.polls ?? 0;
  const advance = () => void i++;

  const run = (): LaunchpadRun => ({
    id: "run1",
    service: "ip-ticketing",
    status: steps[i]?.kind === "done" ? "COMPLETED" : "RUNNING",
    spec: {},
    quote: null,
    creditsHeld: 0,
    creditsSpent: 0,
    progress: {},
    next: steps[i],
    createdAt: "",
    updatedAt: "",
  });

  const confirming = (name: string) => async () => {
    calls.push(`confirm:${name}`);
    if (polls > 0) {
      polls--;
      return { pending: true, status: "PENDING" };
    }
    advance();
    return { pending: false, status: "SUCCEEDED" };
  };

  const deps: TicketingExecutorDeps = {
    client: {
      get: async () => run(),
      uploadUrl: async (_id, name) => (calls.push(`url:${name}`), `https://upload/${name}`),
      uploaded: async (_id, name, cid) => (calls.push(`uploaded:${name}:${cid}`), advance(), { name, uri: `ipfs://${cid}` }),
      metadata: async (_id, address) => (calls.push(`metadata:${address}`), advance(), { tokenUri: "ipfs://m" }),
      resolveWallets: async () => (calls.push("resolve"), options.pending ?? []),
      registerWallet: async (_id, request) => (calls.push(`wallet:${request.recipient}`), { recipient: request.recipient, walletAddress: "0xw" }),
      confirmCollection: confirming("collection"),
      confirmTier: confirming("tier"),
      confirmBatch: confirming("batch"),
    },
    sponsored: async (base) => (calls.push(`sponsored:${base}`), advance(), "0xtx"),
    putFile: async (url) => (calls.push(`put:${url}`), "bafy-cid-1234567"),
    wait: async () => {},
    artwork,
    userAddress: "0xowner",
    collectionBase: (id) => `/runs/${id}/collection`,
    tierBase: (id) => `/runs/${id}/tier`,
    batchBase: (id, index) => `/runs/${id}/batches/${index}`,
  };
  return { deps, calls, advance };
}

describe("executing a paid ticketing run", () => {
  test("walks every step in the order the run asks for them", async () => {
    const { deps, calls } = backend([
      { kind: "collection" },
      { kind: "wait-collection" },
      { kind: "upload", files: ["a.png"] },
      { kind: "ticket-metadata" },
      { kind: "tier" },
      { kind: "wait-tier" },
      { kind: "batch", index: 0 },
      { kind: "wait", index: 0 },
      { kind: "done" },
    ]);
    const events: TicketingEvent["kind"][] = [];
    const finished = await executeTicketingRun("run1", deps, (e) => events.push(e.kind));

    expect(finished.status).toBe("COMPLETED");
    expect(calls).toEqual([
      "sponsored:/runs/run1/collection",
      "confirm:collection",
      "url:a.png",
      "put:https://upload/a.png",
      "uploaded:a.png:bafy-cid-1234567",
      "metadata:0xowner",
      "sponsored:/runs/run1/tier",
      "confirm:tier",
      "sponsored:/runs/run1/batches/0",
      "confirm:batch",
    ]);
    expect(events.at(-1)).toBe("done");
  });

  test("prepares a wallet for each guest the run lists, and none for guests who already have one", async () => {
    const { deps, calls, advance } = backend([{ kind: "wallets" }, { kind: "done" }], { pending: ["ana@x.com", "bruno@x.com"] });
    const register = deps.client.registerWallet;
    deps.client.registerWallet = async (id, request) => {
      const result = await register(id, request);
      if (request.recipient === "bruno@x.com") advance();
      return result;
    };
    await executeTicketingRun("run1", deps);
    expect(calls).toEqual(["resolve", "wallet:ana@x.com", "wallet:bruno@x.com"]);
  });

  test("asks for each guest's wallet by recipient only", async () => {
    const { deps, advance } = backend([{ kind: "wallets" }, { kind: "done" }], { pending: ["ana@x.com"] });
    const requests: unknown[] = [];
    const register = deps.client.registerWallet;
    deps.client.registerWallet = async (id, request) => {
      requests.push(request);
      const result = await register(id, request);
      advance();
      return result;
    };
    await executeTicketingRun("run1", deps);
    expect(requests).toEqual([{ recipient: "ana@x.com" }]);
  });

  test("stops instead of spinning when a guest's wallet is stuck part-way", async () => {
    const { deps, calls } = backend([{ kind: "wallets" }, { kind: "wallets" }, { kind: "wallets" }, { kind: "done" }], { pending: [] });
    deps.client.resolveWallets = async () => (calls.push("resolve"), []);
    await expect(executeTicketingRun("run1", deps)).rejects.toThrow("still being prepared");
    expect(calls).toEqual(["resolve", "resolve"]);
  });

  test("keeps polling a transaction that has not landed yet", async () => {
    const { deps, calls } = backend([{ kind: "wait-tier" }, { kind: "done" }], { polls: 2 });
    await executeTicketingRun("run1", deps);
    expect(calls).toEqual(["confirm:tier", "confirm:tier", "confirm:tier"]);
  });

  test("stops with a plain message when a transaction is still not confirmed after many checks", async () => {
    const { deps } = backend([{ kind: "wait", index: 0 }, { kind: "done" }], { polls: 1000 });
    await expect(executeTicketingRun("run1", { ...deps, maxPolls: 3 })).rejects.toBeInstanceOf(StillConfirmingError);
  });

  test("asks for the artwork again when the page was reloaded and the file is gone", async () => {
    const { deps } = backend([{ kind: "upload", files: ["a.png"] }, { kind: "done" }]);
    const error = await executeTicketingRun("run1", { ...deps, artwork: null }).catch((e) => e);
    expect(error).toBeInstanceOf(MissingFilesError);
    expect((error as MissingFilesError).files).toEqual(["a.png"]);
  });

  test("refuses a run that belongs to another service", async () => {
    const { deps, calls } = backend([{ kind: "done" }]);
    const other = { ...(await deps.client.get("run1")), service: "data-tokenization-erc721" } as unknown as LaunchpadRun;
    deps.client.get = async () => other;
    await expect(executeTicketingRun("run1", deps)).rejects.toThrow("different service");
    expect(calls).toEqual([]);
  });

  test("a run with nothing left to do is finished at once", async () => {
    const { deps, calls } = backend([{ kind: "done" }]);
    await executeTicketingRun("run1", deps);
    expect(calls).toEqual([]);
  });

  test("a wallet, the ticket tier and a batch are each paced with a random wait beforehand", async () => {
    const { deps, advance } = backend(
      [{ kind: "wallets" }, { kind: "tier" }, { kind: "batch", index: 0 }, { kind: "wait", index: 0 }, { kind: "done" }],
      { pending: ["ana@x.com"] },
    );
    const waits: number[] = [];
    deps.wait = async (ms) => void waits.push(ms);
    const register = deps.client.registerWallet;
    deps.client.registerWallet = async (id, request) => {
      const result = await register(id, request);
      advance();
      return result;
    };
    await executeTicketingRun("run1", deps);
    expect(waits).toHaveLength(3);
    for (const ms of waits) {
      expect(ms).toBeGreaterThanOrEqual(1000);
      expect(ms).toBeLessThan(10000);
    }
  });
});
