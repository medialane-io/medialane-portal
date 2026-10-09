import { describe, expect, test } from "bun:test";
import { MissingFilesError, StillConfirmingError } from "@/lib/launchpad/engine";
import { executeRun, type ExecutorDeps, type RunEvent } from "./executor";
import type { LaunchpadRun, NextStep } from "@medialane/sdk";

const file = (name: string) => new File(["x"], name, { type: "application/pdf" });

function fakeBackend(steps: NextStep[]) {
  const calls: string[] = [];
  let i = 0;
  const run = (): LaunchpadRun => ({
    id: "run1",
    service: "data-tokenization-erc721",
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
  const advance = () => {
    i++;
  };
  let pendingPolls = 0;
  let pendingGuests: string[] = [];

  const deps: ExecutorDeps = {
    client: {
      get: async () => run(),
      uploadUrl: async (_id, name) => (calls.push(`url:${name}`), `https://upload/${name}`),
      uploaded: async (_id, name, cid) => (calls.push(`uploaded:${name}:${cid}`), { name, uri: `ipfs://${cid}` }),
      itemMetadata: async (_id, index) => (calls.push(`metadata:${index}`), { index, tokenUri: `ipfs://m${index}` }),
      confirmBatch: async (_id, index) => {
        calls.push(`confirm:${index}`);
        if (pendingPolls > 0) {
          pendingPolls--;
          return { pending: true, status: "PENDING" };
        }
        advance();
        return { pending: false, status: "SUCCEEDED" };
      },
      confirmCollection: async () => (calls.push("confirm:collection"), advance(), { pending: false, status: "SUCCEEDED" }),
      resolveGuests: async () => (calls.push("resolve"), pendingGuests),
      registerGuest: async (_id, request) => {
        calls.push(`guest:${request.recipient}`);
        pendingGuests = pendingGuests.filter((g) => g !== request.recipient);
        if (pendingGuests.length === 0) advance();
        return {} as never;
      },
    },
    sponsored: async (base) => (calls.push(`sponsored:${base}`), advance(), "0xtx"),
    putFile: async (url) => (calls.push(`put:${url}`), `bafy-${url.split("/").pop()}`),
    wait: async () => {},
    files: new Map([
      ["a.pdf", file("a.pdf")],
      ["b.pdf", file("b.pdf")],
    ]),
    userAddress: "0xowner",
    batchBase: (id, index) => `/runs/${id}/batches/${index}`,
    collectionBase: (id) => `/runs/${id}/collection`,
  };

  const withAdvancingUploads = {
    ...deps,
    client: {
      ...deps.client,
      uploaded: async (id: string, name: string, cid: string) => {
        const result = await deps.client.uploaded(id, name, cid);
        if (name === "b.pdf") advance();
        return result;
      },
      itemMetadata: async (id: string, index: number, userAddress: string) => {
        const result = await deps.client.itemMetadata(id, index, userAddress);
        if (index === 1) advance();
        return result;
      },
    },
  };

  return {
    deps: withAdvancingUploads,
    calls,
    setPendingPolls: (n: number) => (pendingPolls = n),
    setPendingGuests: (guests: string[]) => (pendingGuests = guests),
  };
}

describe("executeRun", () => {
  test("walks the backend's steps in order, from the collection to the last confirmed batch", async () => {
    const backend = fakeBackend([
      { kind: "collection" },
      { kind: "wait-collection" },
      { kind: "upload", files: ["a.pdf", "b.pdf"] },
      { kind: "metadata", items: [0, 1] },
      { kind: "batch", index: 0 },
      { kind: "wait", index: 0 },
      { kind: "done" },
    ]);
    const events: RunEvent[] = [];
    const run = await executeRun("run1", backend.deps, (e) => events.push(e));

    expect(run.status).toBe("COMPLETED");
    expect(backend.calls).toEqual([
      "sponsored:/runs/run1/collection",
      "confirm:collection",
      "url:a.pdf",
      "put:https://upload/a.pdf",
      "uploaded:a.pdf:bafy-a.pdf",
      "url:b.pdf",
      "put:https://upload/b.pdf",
      "uploaded:b.pdf:bafy-b.pdf",
      "metadata:0",
      "metadata:1",
      "sponsored:/runs/run1/batches/0",
      "confirm:0",
    ]);
    expect(events.at(-1)).toEqual({ kind: "done" });
  });

  test("refuses a run that belongs to another service", async () => {
    const backend = fakeBackend([{ kind: "done" }]);
    const other = { ...(await backend.deps.client.get("run1")), service: "ip-ticketing" } as unknown as LaunchpadRun;
    backend.deps.client.get = async () => other;
    await expect(executeRun("run1", backend.deps)).rejects.toThrow("different service");
    expect(backend.calls).toEqual([]);
  });

  test("resuming asks only for the files that still need uploading", async () => {
    const backend = fakeBackend([{ kind: "upload", files: ["b.pdf", "c.pdf"] }]);
    const error = await executeRun("run1", backend.deps).catch((e) => e);
    expect(error).toBeInstanceOf(MissingFilesError);
    expect((error as MissingFilesError).files).toEqual(["c.pdf"]);
    expect(backend.calls).toEqual([]);
  });

  test("a batch that keeps confirming stops politely instead of spinning forever", async () => {
    const backend = fakeBackend([{ kind: "wait", index: 0 }, { kind: "done" }]);
    backend.setPendingPolls(100);
    const error = await executeRun("run1", { ...backend.deps, maxPolls: 3 }).catch((e) => e);
    expect(error).toBeInstanceOf(StillConfirmingError);
  });

  test("each batch is paced with a random wait before it is signed", async () => {
    const backend = fakeBackend([{ kind: "batch", index: 0 }, { kind: "wait", index: 0 }, { kind: "done" }]);
    const waits: number[] = [];
    await executeRun("run1", { ...backend.deps, wait: async (ms) => void waits.push(ms) });
    expect(waits).toHaveLength(1);
    expect(waits[0]).toBeGreaterThanOrEqual(1000);
    expect(waits[0]).toBeLessThan(10000);
  });

  test("prepares a wallet for each guest the run lists", async () => {
    const backend = fakeBackend([{ kind: "wallets" }, { kind: "done" }]);
    backend.setPendingGuests(["ana@x.com", "bruno@x.com"]);
    const events: RunEvent[] = [];
    await executeRun("run1", backend.deps, (e) => events.push(e));
    expect(backend.calls).toEqual(["resolve", "guest:ana@x.com", "guest:bruno@x.com"]);
    expect(events.filter((e) => e.kind === "wallets")).toEqual([
      { kind: "wallets", done: 0, total: 2 },
      { kind: "wallets", done: 1, total: 2 },
    ]);
  });
});
