import { describe, expect, test } from "bun:test";
import { executeCertificateEmissionRun, transactionPacingMs, type CertificateEmissionExecutorDeps, type CertificateEmissionEvent } from "./run-executor";
import { MissingFilesError, StillConfirmingError } from "@/lib/launchpad/run-executor";
import type { CertificateEmissionNextStep, LaunchpadRun } from "@medialane/sdk";

const artwork = new File(["x"], "a.png", { type: "image/png" });

function backend(steps: CertificateEmissionNextStep[], options: { pending?: string[]; polls?: number } = {}) {
  const calls: string[] = [];
  const waits: number[] = [];
  let i = 0;
  let polls = options.polls ?? 0;
  const advance = () => void i++;

  const run = (): LaunchpadRun => ({
    id: "run1",
    service: "certificate-emission",
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

  const deps: CertificateEmissionExecutorDeps = {
    client: {
      get: async () => run(),
      uploadUrl: async (_id, name) => (calls.push(`url:${name}`), `https://upload/${name}`),
      uploaded: async (_id, name, cid) => (calls.push(`uploaded:${name}:${cid}`), advance(), { name, uri: `ipfs://${cid}` }),
      metadata: async (_id, address) => (calls.push(`metadata:${address}`), advance(), { tokenUri: "ipfs://m" }),
      resolveWallets: async () => (calls.push("resolve"), options.pending ?? []),
      registerWallet: async (_id, request) => (calls.push(`wallet:${request.recipient}`), { recipient: request.recipient, walletAddress: "0xw" }),
      confirmCollection: confirming("collection"),
      confirmBatch: confirming("batch"),
    },
    sponsored: async (base) => (calls.push(`sponsored:${base}`), advance(), "0xtx"),
    putFile: async (url) => (calls.push(`put:${url}`), "bafy-cid-1234567"),
    wait: async (ms) => void waits.push(ms),
    artwork,
    userAddress: "0xowner",
    collectionBase: (id) => `/runs/${id}/collection`,
    batchBase: (id, index) => `/runs/${id}/batches/${index}`,
  };
  return { deps, calls, waits, advance };
}

describe("executing a paid certificate-emission run", () => {
  test("walks every step in the order the run asks for them — no tier step", async () => {
    const { deps, calls } = backend([
      { kind: "collection" },
      { kind: "wait-collection" },
      { kind: "upload", files: ["a.png"] },
      { kind: "certificate-metadata" },
      { kind: "batch", index: 0 },
      { kind: "wait", index: 0 },
      { kind: "done" },
    ]);
    const events: CertificateEmissionEvent["kind"][] = [];
    const finished = await executeCertificateEmissionRun("run1", deps, (e) => events.push(e.kind));

    expect(finished.status).toBe("COMPLETED");
    expect(calls).toEqual([
      "sponsored:/runs/run1/collection",
      "confirm:collection",
      "url:a.png",
      "put:https://upload/a.png",
      "uploaded:a.png:bafy-cid-1234567",
      "metadata:0xowner",
      "sponsored:/runs/run1/batches/0",
      "confirm:batch",
    ]);
    expect(events.at(-1)).toBe("done");
  });

  test("prepares a wallet for each recipient the run lists, and none for recipients who already have one", async () => {
    const { deps, calls, advance } = backend([{ kind: "wallets" }, { kind: "done" }], { pending: ["ana@x.com", "bruno@x.com"] });
    const register = deps.client.registerWallet;
    deps.client.registerWallet = async (id, request) => {
      const result = await register(id, request);
      if (request.recipient === "bruno@x.com") advance();
      return result;
    };
    await executeCertificateEmissionRun("run1", deps);
    expect(calls).toEqual(["resolve", "wallet:ana@x.com", "wallet:bruno@x.com"]);
  });

  test("stops instead of spinning when a recipient's wallet is stuck part-way", async () => {
    const { deps, calls } = backend([{ kind: "wallets" }, { kind: "wallets" }, { kind: "wallets" }, { kind: "done" }], { pending: [] });
    deps.client.resolveWallets = async () => (calls.push("resolve"), []);
    await expect(executeCertificateEmissionRun("run1", deps)).rejects.toThrow("still being prepared");
    expect(calls).toEqual(["resolve", "resolve"]);
  });

  test("keeps polling a transaction that has not landed yet", async () => {
    const { deps, calls } = backend([{ kind: "wait", index: 0 }, { kind: "done" }], { polls: 2 });
    await executeCertificateEmissionRun("run1", deps);
    expect(calls).toEqual(["confirm:batch", "confirm:batch", "confirm:batch"]);
  });

  test("stops with a plain message when a transaction is still not confirmed after many checks", async () => {
    const { deps } = backend([{ kind: "wait", index: 0 }, { kind: "done" }], { polls: 1000 });
    await expect(executeCertificateEmissionRun("run1", { ...deps, maxPolls: 3 })).rejects.toBeInstanceOf(StillConfirmingError);
  });

  test("asks for the artwork again when the page was reloaded and the file is gone", async () => {
    const { deps } = backend([{ kind: "upload", files: ["a.png"] }, { kind: "done" }]);
    const error = await executeCertificateEmissionRun("run1", { ...deps, artwork: null }).catch((e) => e);
    expect(error).toBeInstanceOf(MissingFilesError);
    expect((error as MissingFilesError).files).toEqual(["a.png"]);
  });

  test("refuses a run that belongs to another service", async () => {
    const { deps, calls } = backend([{ kind: "done" }]);
    const other = { ...(await deps.client.get("run1")), service: "data-tokenization-erc721" } as unknown as LaunchpadRun;
    deps.client.get = async () => other;
    await expect(executeCertificateEmissionRun("run1", deps)).rejects.toThrow("different service");
    expect(calls).toEqual([]);
  });

  test("a run with nothing left to do is finished at once", async () => {
    const { deps, calls } = backend([{ kind: "done" }]);
    await executeCertificateEmissionRun("run1", deps);
    expect(calls).toEqual([]);
  });

  test("a wallet deployment and a batch are each paced with a random wait beforehand", async () => {
    const { deps, waits, advance } = backend(
      [{ kind: "wallets" }, { kind: "batch", index: 0 }, { kind: "wait", index: 0 }, { kind: "done" }],
      { pending: ["ana@x.com"] },
    );
    const register = deps.client.registerWallet;
    deps.client.registerWallet = async (id, request) => {
      const result = await register(id, request);
      advance();
      return result;
    };
    await executeCertificateEmissionRun("run1", deps);
    expect(waits).toHaveLength(2);
    for (const ms of waits) {
      expect(ms).toBeGreaterThanOrEqual(1000);
      expect(ms).toBeLessThan(10000);
    }
  });
});
