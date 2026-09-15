import { describe, expect, test } from "bun:test";
import { executeRun, MissingFilesError, StillConfirmingError, putFileToSignedUrl, type ExecutorDeps, type RunEvent } from "./run-executor";
import type { LaunchpadRun, NextStep } from "./runs-client";

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

  return { deps: withAdvancingUploads, calls, setPendingPolls: (n: number) => (pendingPolls = n) };
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
});

describe("putFileToSignedUrl", () => {
  test("posts the file to the signed URL and returns the pinned CID", async () => {
    let sent: FormData | null = null;
    const fetchImpl = (async (_url: string, init?: RequestInit) => {
      sent = init?.body as FormData;
      return new Response(JSON.stringify({ data: { cid: "bafy123" } }), { status: 200 });
    }) as unknown as typeof fetch;
    expect(await putFileToSignedUrl("https://upload", file("a.pdf"), fetchImpl)).toBe("bafy123");
    expect((sent!.get("file") as File).name).toBe("a.pdf");
    expect(sent!.get("network")).toBe("public");
  });

  test("an upload without a CID is an error", async () => {
    const fetchImpl = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    await expect(putFileToSignedUrl("https://upload", file("a.pdf"), fetchImpl)).rejects.toThrow();
  });
});
