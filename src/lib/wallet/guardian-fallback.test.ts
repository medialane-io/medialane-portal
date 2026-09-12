import { test, expect, mock, afterEach } from "bun:test";
import type { SealedOwner } from "./passkey";
import { registerSelfFundConsentHandler } from "./self-fund-consent";

const FAKE_SEALED: SealedOwner = {
  credentialId: "cred1", ownerPubKey: "0xabc", address: "0xdeadbeef", iv: "iv1", ciphertext: "ct1",
};

afterEach(() => registerSelfFundConsentHandler(null));

test("cancelEscape falls back to a self-funded transaction when the sponsor is unavailable and the user consents", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "unavailable", reason: "AVNU unavailable" }),
    SponsoredCallRejectedError: class extends Error {},
  }));
  registerSelfFundConsentHandler(async () => true);
  let selfFundedAddress: string | null = null;
  mock.module("./self-funded", () => ({
    executeSelfFunded: async (address: string) => {
      selfFundedAddress = address;
      return { transactionHash: "0xselffunded" };
    },
  }));

  const { cancelEscape } = await import("./guardian");
  const txHash = await cancelEscape(FAKE_SEALED);

  expect(txHash).toBe("0xselffunded");
  expect(selfFundedAddress).toBe(FAKE_SEALED.address);
});

test("triggerEscapeOwner falls back using the target account's address, not the guardian's", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xguardianprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "unavailable", reason: "AVNU unavailable" }),
    SponsoredCallRejectedError: class extends Error {},
  }));
  registerSelfFundConsentHandler(async () => true);
  let selfFundedAddress: string | null = null;
  mock.module("./self-funded", () => ({
    executeSelfFunded: async (address: string) => {
      selfFundedAddress = address;
      return { transactionHash: "0xselffunded" };
    },
  }));

  const { triggerEscapeOwner } = await import("./guardian");
  const targetAddress = "0x1234567890abcdef";
  const txHash = await triggerEscapeOwner(FAKE_SEALED, targetAddress, "0xabc123");

  expect(txHash).toBe("0xselffunded");
  expect(selfFundedAddress).not.toBe(FAKE_SEALED.address);
});

test("cancelEscape throws without self-funding when the user declines", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "unavailable", reason: "AVNU unavailable" }),
    SponsoredCallRejectedError: class extends Error {},
  }));
  registerSelfFundConsentHandler(async () => false);
  let selfFundedCalls = 0;
  mock.module("./self-funded", () => ({
    executeSelfFunded: async () => {
      selfFundedCalls++;
      return { transactionHash: "0xselffunded" };
    },
  }));

  const { cancelEscape } = await import("./guardian");
  await expect(cancelEscape(FAKE_SEALED)).rejects.toThrow("AVNU unavailable");
  expect(selfFundedCalls).toBe(0);
});
