import { expect, test } from "bun:test";
import { apiKeyConfirmationTypedData } from "@medialane/sdk/starknet";
import { signKeyConfirmation, CONFIRMATION_SECONDS } from "./key-confirmation";

test("the wallet signs exactly this change for this account, valid for a few minutes", async () => {
  const signed: unknown[] = [];
  const signer = { signTypedData: async (data: unknown) => { signed.push(data); return ["0x1", "0x2"]; } };
  const confirmation = await signKeyConfirmation(signer, "acc_ABC", { action: "delete_api_key", key: "k1" }, 1_700_000_000);
  expect(confirmation).toEqual({ expiresAt: 1_700_000_000 + CONFIRMATION_SECONDS, signature: ["0x1", "0x2"] });
  expect(signed).toEqual([apiKeyConfirmationTypedData({ action: "delete_api_key", key: "k1", account: "acc_ABC", expiresAt: 1_700_000_000 + CONFIRMATION_SECONDS })]);
  expect(CONFIRMATION_SECONDS).toBeLessThanOrEqual(300);
});
