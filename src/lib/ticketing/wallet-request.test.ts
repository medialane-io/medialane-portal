import { expect, test } from "bun:test";
import { provisioningSecret, walletRequestFor } from "./wallet-request";

test("the guests' wallet keys come from one signature the person gives, so only they can re-derive them", async () => {
  const seen: unknown[] = [];
  const signer = {
    signTypedData: async (data: unknown) => (seen.push(data), ["0x1", "0x2"]),
  };
  const secret = await provisioningSecret(signer);

  expect(new TextDecoder().decode(secret)).toBe("0x10x2");
  const typed = seen[0] as { primaryType: string; message: { purpose: string }; domain: { name: string } };
  expect(typed.primaryType).toBe("Provisioning");
  expect(typed.domain.name).toBe("Medialane");
  expect(typed.message.purpose.length).toBeLessThanOrEqual(31);
});

test("a signature that comes back as one value is used as it is", async () => {
  const secret = await provisioningSecret({ signTypedData: async () => "0xabc" as never });
  expect(new TextDecoder().decode(secret)).toBe("0xabc");
});

test("a guest's wallet is built by the run, never through the portal's own proxy", async () => {
  const asked: unknown[] = [];
  const fetched: unknown[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (...args: unknown[]) => (fetched.push(args), new Response("{}"))) as never;
  try {
    const build = async (owner: { ownerPubkey: string; ownerAddress: string }) => {
      asked.push(owner);
      throw new Error("stop after the build is asked for");
    };
    await expect(walletRequestFor(new TextEncoder().encode("0xsecret"), "ana@x.com", build)).rejects.toThrow("stop after");
  } finally {
    globalThis.fetch = realFetch;
  }
  expect(asked).toHaveLength(1);
  expect(Object.keys(asked[0] as object).sort()).toEqual(["ownerAddress", "ownerPubkey"]);
  expect(fetched).toEqual([]);
});
