import { test, expect } from "bun:test";
import { atomicAmount, creditsFor, transferCall } from "./credits";

const TERMS = { treasury: "0xtreasury", asset: "0xusdc", creditsPerUsdc: 100, decimals: 6 };

test("a dollar amount becomes atomic units", () => {
  expect(atomicAmount("1", 6)).toBe(1_000_000n);
  expect(atomicAmount("0.5", 6)).toBe(500_000n);
  expect(atomicAmount("12.34", 6)).toBe(12_340_000n);
});

test("nothing, zero, and nonsense are all refused rather than sent", () => {
  for (const bad of ["", "0", "0.00", "-5", "abc", "1.2.3"]) {
    expect(atomicAmount(bad, 6)).toBeNull();
  }
});

test("more decimal places than the token has is refused, not silently rounded", () => {
  expect(atomicAmount("1.1234567", 6)).toBeNull();
  expect(atomicAmount("1.123456", 6)).toBe(1_123_456n);
});

test("credits are what a dollar amount buys, rounded down", () => {
  expect(creditsFor("1", 100)).toBe(100);
  expect(creditsFor("2.5", 100)).toBe(250);
  expect(creditsFor("0.999", 100)).toBe(99);
  expect(creditsFor("", 100)).toBe(0);
});

test("the transfer sends the amount to the treasury as a u256", () => {
  const call = transferCall(TERMS, 1_000_000n);
  expect(call.contractAddress).toBe("0xusdc");
  expect(call.entrypoint).toBe("transfer");
  expect(call.calldata).toEqual(["0xtreasury", "1000000", "0"]);
});

test("an amount past 2^128 fills both words", () => {
  expect(transferCall(TERMS, 2n ** 128n + 7n).calldata).toEqual(["0xtreasury", "7", "1"]);
});
