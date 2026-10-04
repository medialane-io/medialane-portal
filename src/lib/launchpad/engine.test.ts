import { describe, expect, test } from "bun:test";
import type { DataTokenizationRun, NextStep } from "@medialane/sdk";
import { RunAbortedError, runEngine, untilConfirmed, walletsStep, type StepTable } from "./engine";

const run = (next: NextStep | undefined, status: DataTokenizationRun["status"] = "RUNNING"): DataTokenizationRun => ({
  id: "r1",
  service: "data-tokenization-erc721",
  status,
  spec: {},
  quote: null,
  creditsHeld: 0,
  creditsSpent: 0,
  progress: {},
  next,
  createdAt: "",
  updatedAt: "",
});

function harness(queue: NextStep[]) {
  const seen: string[] = [];
  let i = 0;
  const steps = {
    collection: async () => void (seen.push("collection"), i++),
    "wait-collection": async () => void (seen.push("wait-collection"), i++),
    upload: async () => void (seen.push("upload"), i++),
    metadata: async () => void (seen.push("metadata"), i++),
    batch: async (next) => void (seen.push(`batch:${next.index}`), i++),
    wait: async (next) => void (seen.push(`wait:${next.index}`), i++),
  } satisfies StepTable<NextStep>;
  const options = {
    runId: "r1",
    load: async () => run(queue[i]),
    owns: (r: unknown): r is DataTokenizationRun => (r as DataTokenizationRun).service === "data-tokenization-erc721",
    steps,
    onDone: () => void seen.push("done"),
  };
  return { seen, options };
}

describe("runEngine", () => {
  test("dispatches whatever the backend asks for, in order, until it is done", async () => {
    const { seen, options } = harness([{ kind: "collection" }, { kind: "batch", index: 2 }, { kind: "wait", index: 2 }, { kind: "done" }]);
    await runEngine(options);
    expect(seen).toEqual(["collection", "batch:2", "wait:2", "done"]);
  });

  test("a completed run needs no further step", async () => {
    const { seen, options } = harness([]);
    await runEngine({ ...options, load: async () => run({ kind: "collection" }, "COMPLETED") });
    expect(seen).toEqual(["done"]);
  });

  test("stops between steps once aborted", async () => {
    const { seen, options } = harness([{ kind: "collection" }, { kind: "batch", index: 0 }, { kind: "done" }]);
    const controller = new AbortController();
    const steps = { ...options.steps, collection: async () => void (seen.push("collection"), controller.abort()) };
    const error = await runEngine({ ...options, steps, signal: controller.signal }).catch((e) => e);
    expect(error).toBeInstanceOf(RunAbortedError);
    expect(seen).toEqual(["collection"]);
  });
});

describe("untilConfirmed", () => {
  test("does not poll again once aborted", async () => {
    const controller = new AbortController();
    let polls = 0;
    const error = await untilConfirmed(
      { wait: async () => controller.abort(), signal: controller.signal },
      async () => (polls++, { pending: true, status: "PENDING" }),
    ).catch((e) => e);
    expect(error).toBeInstanceOf(RunAbortedError);
    expect(polls).toBe(1);
  });
});

describe("walletsStep", () => {
  const make = (batches: string[][]) => {
    const registered: string[] = [];
    const progress: string[] = [];
    let call = 0;
    const step = walletsStep<string>({
      resolve: async () => batches[call++] ?? [],
      register: async (_id, r) => void registered.push(r),
      onProgress: (done, total) => void progress.push(`${done}/${total}`),
      stalledMessage: "stuck",
    });
    return { step, registered, progress };
  };

  test("registers each pending recipient and reports progress", async () => {
    const { step, registered, progress } = make([["a", "b"]]);
    await step(null, "r1");
    expect(registered).toEqual(["a", "b"]);
    expect(progress).toEqual(["0/2", "1/2"]);
  });

  test("an empty pass is fine once, but a second one means it is stuck", async () => {
    const { step } = make([[], []]);
    await step(null, "r1");
    await expect(step(null, "r1")).rejects.toThrow("stuck");
  });
});
