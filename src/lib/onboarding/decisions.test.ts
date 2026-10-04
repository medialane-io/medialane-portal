import { describe, expect, test } from "bun:test";
import { afterCodeVerified } from "./decisions";

const WALLET = "0x01575d29b83d7828cd1d833ef785083b809adeb187b6ac14aab21db568f2bf02";
const OTHER = "0x0222222222222222222222222222222222222222222222222222222222222222";

describe("after the login code is verified", () => {
  test("a new account has no wallet yet: create it", () => {
    expect(afterCodeVerified(null, null)).toEqual({ type: "wallet-setup" });
  });

  test("an account that exists but never got a wallet: create it, even if this device holds another key", () => {
    expect(afterCodeVerified(null, OTHER)).toEqual({ type: "wallet-setup" });
  });

  test("a returning user on the device that holds the key is finished", () => {
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: false }, WALLET)).toEqual({ type: "finish" });
  });

  test("addresses match whatever their padding or case", () => {
    const padded = WALLET.replace("0x0", "0x").toUpperCase().replace("0X", "0x");
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: false }, padded)).toEqual({ type: "finish" });
  });

  test("a returning user on a device with no key must pair or recover", () => {
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: false }, null)).toEqual({
      type: "pair-or-recover",
      walletAddress: WALLET,
    });
  });

  test("a device holding the key to a different wallet must pair or recover too", () => {
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: false }, OTHER)).toEqual({
      type: "pair-or-recover",
      walletAddress: WALLET,
    });
  });

  test("a wallet that still has the platform's provisioning key is finished on medialane.io, never from here", () => {
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: true }, null)).toEqual({ type: "setup-elsewhere" });
    expect(afterCodeVerified({ walletAddress: WALLET, needsKeySetup: true }, WALLET)).toEqual({ type: "setup-elsewhere" });
  });
});
