import { test, expect } from "bun:test";
import { generateStarkKeyPair, InvalidStarkPrivateKeyError } from "@medialane/sdk/starknet";
import { computeWalletAddress } from "./account";
import { walletAddressForPrivateKey } from "./passkey";

test("a key restores the same address the wallet was created with", () => {
  for (let i = 0; i < 25; i++) {
    const { privateKeyHex, publicKeyHex } = generateStarkKeyPair();
    const createdAddress = computeWalletAddress(publicKeyHex, 0);
    expect(walletAddressForPrivateKey(privateKeyHex)).toBe(createdAddress);
  }
});

test("formatting differences in a pasted key still restore the same address", () => {
  const { privateKeyHex } = generateStarkKeyPair();
  const expected = walletAddressForPrivateKey(privateKeyHex);
  expect(walletAddressForPrivateKey(`  ${privateKeyHex}  `)).toBe(expected);
  expect(walletAddressForPrivateKey(`${privateKeyHex}\n`)).toBe(expected);
  expect(walletAddressForPrivateKey(privateKeyHex.slice(2))).toBe(expected);
});

test("two different keys never resolve to the same address", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const { privateKeyHex } = generateStarkKeyPair();
    seen.add(walletAddressForPrivateKey(privateKeyHex));
  }
  expect(seen.size).toBe(50);
});

test("a malformed key is refused rather than resolving to some other wallet", () => {
  for (const bad of ["", "0x", "0x0", "nonsense", "0xzz", "0x" + "f".repeat(64)]) {
    expect(() => walletAddressForPrivateKey(bad)).toThrow(InvalidStarkPrivateKeyError);
  }
});

test("a truncated key does not silently resolve to a valid-looking address", () => {
  const { privateKeyHex } = generateStarkKeyPair();
  const full = walletAddressForPrivateKey(privateKeyHex);
  const truncated = privateKeyHex.slice(0, -4);
  expect(walletAddressForPrivateKey(truncated)).not.toBe(full);
});
