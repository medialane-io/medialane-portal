import { test, expect, afterEach } from "bun:test";
import { executeSponsored } from "./issue";
import { OUT_OF_CREDITS } from "./task-progress";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const calls = [{ contractAddress: "0x1", entrypoint: "mint", calldata: ["0x2"] }];
const account = { address: "0xbeef", signMessage: async () => ["0xr", "0xs"] };

function stub(responses: { status: number; body: unknown }[]) {
  const seen: { url: string; body: unknown }[] = [];
  let i = 0;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    seen.push({ url: String(url), body: JSON.parse(String(init?.body ?? "null")) });
    const next = responses[i++];
    return new Response(JSON.stringify(next.body), { status: next.status });
  }) as typeof fetch;
  return seen;
}

test("a sponsored call is built, signed, then executed", async () => {
  const seen = stub([
    { status: 200, body: { typedData: { message: "m" } } },
    { status: 200, body: { transactionHash: "0xtx" } },
  ]);

  expect(await executeSponsored(account, calls)).toBe("0xtx");
  expect(seen[0].url).toBe("/api/portal/paymaster/invoke/build");
  expect(seen[1].url).toBe("/api/portal/paymaster/invoke/execute");
});

test("the signature and the built typed data are sent back for execution", async () => {
  const seen = stub([
    { status: 200, body: { typedData: { message: "m" } } },
    { status: 200, body: { transactionHash: "0xtx" } },
  ]);
  await executeSponsored(account, calls);

  expect(seen[1].body).toEqual({
    userAddress: "0xbeef",
    typedData: { message: "m" },
    signature: ["0xr", "0xs"],
    calls,
  });
});

test("running out of credits while building says so", async () => {
  stub([{ status: 402, body: { error: "no credits" } }]);
  expect(executeSponsored(account, calls)).rejects.toThrow(OUT_OF_CREDITS);
});

test("running out of credits while executing says so", async () => {
  stub([
    { status: 200, body: { typedData: {} } },
    { status: 402, body: { error: "no credits" } },
  ]);
  expect(executeSponsored(account, calls)).rejects.toThrow(OUT_OF_CREDITS);
});

test("the backend's reason for refusing is what the business reads", async () => {
  stub([{ status: 400, body: { error: 'Entrypoint "burn" is not eligible for sponsored gas' } }]);
  expect(executeSponsored(account, calls)).rejects.toThrow('Entrypoint "burn" is not eligible for sponsored gas');
});

test("a send with no transaction hash is not reported as success", async () => {
  stub([
    { status: 200, body: { typedData: {} } },
    { status: 200, body: {} },
  ]);
  expect(executeSponsored(account, calls)).rejects.toThrow("no hash came back");
});

test("a single string signature is still sent as an array", async () => {
  const seen = stub([
    { status: 200, body: { typedData: {} } },
    { status: 200, body: { transactionHash: "0xtx" } },
  ]);
  await executeSponsored({ address: "0xbeef", signMessage: async () => "0xsig" }, calls);
  expect((seen[1].body as { signature: string[] }).signature).toEqual(["0xsig"]);
});
