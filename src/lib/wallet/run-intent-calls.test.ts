import { test, expect } from "bun:test";
import { runIntentCalls } from "./run-intent-calls";

test("runs the created intent's calls with its id", async () => {
  const calls = [{ contractAddress: "0x1", entrypoint: "claim", calldata: ["1", "0"] }];
  const seen: unknown[] = [];
  const signer = { execute: async (c: unknown, opts?: unknown) => { seen.push({ c, opts }); return { txHash: "0xtx" }; } };
  const result = await runIntentCalls(signer, async () => ({ data: { id: "i1", requiresSignature: false as const, calls, expiresAt: "" } }));
  expect(result).toEqual({ txHash: "0xtx" });
  expect(seen).toEqual([{ c: calls, opts: { intentIds: ["i1"] } }]);
});
