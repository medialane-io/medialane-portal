import { test, expect } from "bun:test";
import { encodeRecoveryKey, generateStarkKeyPair, InvalidRecoveryKeyError, parseRecoveryKey } from "@medialane/sdk/starknet";
import { computeWalletAddress } from "./account";

const WALLET = "0x071c174b93d24b72fc4b25e1d28fce1267e30c4c57fa4b0980a403a97fa84f5f";

test("an exported recovery key restores the wallet it was exported from, with the same key", () => {
  for (let i = 0; i < 25; i++) {
    const { privateKeyHex } = generateStarkKeyPair();
    expect(parseRecoveryKey(encodeRecoveryKey({ walletAddress: WALLET, privateKey: privateKeyHex }))).toEqual({
      walletAddress: WALLET,
      privateKey: privateKeyHex,
    });
  }
});

test("a key saved before recovery keys carried the address restores the wallet it created", () => {
  for (let i = 0; i < 25; i++) {
    const { privateKeyHex, publicKeyHex } = generateStarkKeyPair();
    expect(BigInt(parseRecoveryKey(privateKeyHex).walletAddress)).toBe(BigInt(computeWalletAddress(publicKeyHex, 0)));
  }
});

test("formatting differences in a pasted recovery key still restore the same wallet", () => {
  const { privateKeyHex } = generateStarkKeyPair();
  const encoded = encodeRecoveryKey({ walletAddress: WALLET, privateKey: privateKeyHex });
  expect(parseRecoveryKey(`  ${encoded}  `).walletAddress).toBe(WALLET);
  expect(parseRecoveryKey(`${encoded}\n`).walletAddress).toBe(WALLET);
});

test("a malformed or truncated recovery key is refused rather than resolving to some other wallet", () => {
  const { privateKeyHex } = generateStarkKeyPair();
  const encoded = encodeRecoveryKey({ walletAddress: WALLET, privateKey: privateKeyHex });
  for (const bad of ["", "0x", "0x0", "nonsense", "0xzz", "0x" + "f".repeat(64), encoded.slice(0, 30)]) {
    expect(() => parseRecoveryKey(bad)).toThrow(InvalidRecoveryKeyError);
  }
});
