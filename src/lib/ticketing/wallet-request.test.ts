import { expect, test } from "bun:test";
import { provisioningSecret } from "./wallet-request";

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
