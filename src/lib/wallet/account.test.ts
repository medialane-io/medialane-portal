import { test, expect } from "bun:test";
import {
  ownerConstructorCalldata,
  computeWalletAddress,
  MEDIAWALLET_CLASS_HASH,
} from "./account";

const OWNER = "0x61cc05c5da6e9b1403a27ffa564498cd2b8cda1428b053b08dbbd1cceb744c6";

test("owner constructor calldata is [0, pubkey, 1]", () => {
  expect(ownerConstructorCalldata("0xabc")).toEqual(["0x0", "0xabc", "0x1"]);
});

test("computeWalletAddress is deterministic", () => {
  expect(computeWalletAddress(OWNER, 0)).toBe(computeWalletAddress(OWNER, 0));
});

test("computeWalletAddress varies with salt and owner", () => {
  expect(computeWalletAddress(OWNER, 1)).not.toBe(computeWalletAddress(OWNER, 0));
  expect(computeWalletAddress("0xdead", 0)).not.toBe(computeWalletAddress(OWNER, 0));
});

test("computeWalletAddress uses the MediaWallet class hash", () => {
  expect(BigInt(MEDIAWALLET_CLASS_HASH)).toBe(
    BigInt("0x014b210c7d47392691144bafecdca3c6c7791cc295ea305988da0a724c05ac31"),
  );
});

