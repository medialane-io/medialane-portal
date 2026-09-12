import { test, expect, mock, afterEach } from "bun:test";
import type { SealedOwner } from "./passkey";
import { registerSelfFundConsentHandler } from "./self-fund-consent";

const FAKE_SEALED: SealedOwner = {
  credentialId: "cred1", ownerPubKey: "0xabc", address: "0xdeadbeef", iv: "iv1", ciphertext: "ct1",
};

afterEach(() => registerSelfFundConsentHandler(null));

test("starknetVenueSigner exposes the wallet's address", async () => {
  const { starknetVenueSigner } = await import("./venue-signer");
  const signer = starknetVenueSigner(FAKE_SEALED);
  expect(signer.address).toBe("0xdeadbeef");
});

test("signTypedData followed by execute only prompts the passkey once", async () => {
  let unlockCalls = 0;
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => {
      unlockCalls++;
      return "0xprivkey";
    },
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "sponsored", transactionHash: "0xtxhash" }),
  }));

  const { starknetVenueSigner } = await import("./venue-signer");
  const signer = starknetVenueSigner(FAKE_SEALED);

  await signer.signTypedData({
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Ping: [{ name: "value", type: "felt" }],
    },
    primaryType: "Ping",
    domain: { name: "test", version: "1", chainId: "SN_MAIN", revision: "1" },
    message: { value: "1" },
  });
  await signer.execute([{ contractAddress: "0x1", entrypoint: "foo", calldata: [] }]);

  expect(unlockCalls).toBe(1);

  const { lockVenueSigner } = await import("./venue-signer");
  lockVenueSigner(FAKE_SEALED.address);
  await signer.signTypedData({
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Ping: [{ name: "value", type: "felt" }],
    },
    primaryType: "Ping",
    domain: { name: "test", version: "1", chainId: "SN_MAIN", revision: "1" },
    message: { value: "1" },
  });
  expect(unlockCalls).toBe(2);

  lockVenueSigner(FAKE_SEALED.address);
});

test("execute self-funds when sponsorship is unavailable and the user consents", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "unavailable", reason: "no credits" }),
    SponsoredCallRejectedError: class extends Error {},
  }));
  registerSelfFundConsentHandler(async () => true);
  let selfFundedCalls = 0;
  mock.module("./self-funded", () => ({
    executeSelfFunded: async () => {
      selfFundedCalls++;
      return { transactionHash: "0xselffunded" };
    },
  }));

  const { starknetVenueSigner, lockVenueSigner } = await import("./venue-signer");
  const signer = starknetVenueSigner(FAKE_SEALED);
  const result = await signer.execute([{ contractAddress: "0x1", entrypoint: "foo", calldata: [] }]);

  expect(selfFundedCalls).toBe(1);
  expect(result.txHash).toBe("0xselffunded");

  lockVenueSigner(FAKE_SEALED.address);
  registerSelfFundConsentHandler(null);
});

test("execute throws without self-funding when sponsorship is unavailable and the user declines", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => ({ status: "unavailable", reason: "no credits" }),
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

  const { starknetVenueSigner, lockVenueSigner } = await import("./venue-signer");
  const signer = starknetVenueSigner(FAKE_SEALED);

  await expect(
    signer.execute([{ contractAddress: "0x1", entrypoint: "foo", calldata: [] }]),
  ).rejects.toThrow("no credits");
  expect(selfFundedCalls).toBe(0);

  lockVenueSigner(FAKE_SEALED.address);
  registerSelfFundConsentHandler(null);
});

test("execute does not offer self-fund when the sponsored call itself is rejected (not just unavailable)", async () => {
  mock.module("./passkey", () => ({
    unlockOwnerKey: async () => "0xprivkey",
    signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
  }));
  class SponsoredCallRejectedError extends Error {}
  mock.module("./sponsored-executor", () => ({
    executeSponsored: async () => {
      throw new SponsoredCallRejectedError("We couldn't submit this transaction. Please try again.");
    },
    SponsoredCallRejectedError,
  }));
  let consentCalls = 0;
  registerSelfFundConsentHandler(async () => {
    consentCalls++;
    return true;
  });
  let selfFundedCalls = 0;
  mock.module("./self-funded", () => ({
    executeSelfFunded: async () => {
      selfFundedCalls++;
      return { transactionHash: "0xselffunded" };
    },
  }));

  const { starknetVenueSigner, lockVenueSigner } = await import("./venue-signer");
  const signer = starknetVenueSigner(FAKE_SEALED);

  await expect(
    signer.execute([{ contractAddress: "0x1", entrypoint: "foo", calldata: [] }]),
  ).rejects.toThrow("We couldn't submit this transaction. Please try again.");
  expect(consentCalls).toBe(0);
  expect(selfFundedCalls).toBe(0);

  lockVenueSigner(FAKE_SEALED.address);
  registerSelfFundConsentHandler(null);
});
