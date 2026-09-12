import { test, expect } from "bun:test";
import { isRecoveryKeyForWallet } from "./recovery-key";

const SEALED = {
  credentialId: "c",
  ownerPubKey: "0x151c1fe8a4c7edba2dab3e168c4ab4638c606b5f6a14bdfdbd68c7f3241ac5",
  address: "",
  iv: "i",
  ciphertext: "x",
};

test("the original owner's key derives its own wallet address", async () => {
  const { computeWalletAddress } = await import("./account");
  const sealed = { ...SEALED, address: computeWalletAddress(SEALED.ownerPubKey, 0) };
  expect(isRecoveryKeyForWallet(sealed)).toBe(true);
});

test("a paired device's key does not derive the wallet address", () => {
  const sealed = { ...SEALED, address: "0xdeadbeef" };
  expect(isRecoveryKeyForWallet(sealed)).toBe(false);
});

test("address comparison ignores leading-zero padding differences", async () => {
  const { computeWalletAddress } = await import("./account");
  const derived = computeWalletAddress(SEALED.ownerPubKey, 0);
  const unpadded = `0x${BigInt(derived).toString(16)}`;
  expect(isRecoveryKeyForWallet({ ...SEALED, address: unpadded })).toBe(true);
});
