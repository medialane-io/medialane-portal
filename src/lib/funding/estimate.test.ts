import { describe, expect, test } from "bun:test";
import { atomicAmount, creditsEstimate } from "./estimate";

describe("the amount typed in the chosen token", () => {
  test("is read exactly in the token's units", () => {
    expect(atomicAmount("5", 18)).toBe(5_000_000_000_000_000_000n);
    expect(atomicAmount("10.5", 6)).toBe(10_500_000n);
    expect(atomicAmount("0.000001", 6)).toBe(1n);
  });

  test("is refused when empty, zero, text or with more decimals than the token has", () => {
    expect(atomicAmount("", 6)).toBeNull();
    expect(atomicAmount("0", 6)).toBeNull();
    expect(atomicAmount("abc", 6)).toBeNull();
    expect(atomicAmount("1.1234567", 6)).toBeNull();
  });
});

describe("the credits estimate", () => {
  test("is the amount's dollar value at one credit per cent", () => {
    expect(creditsEstimate("10", "USDC", undefined)).toBe(1000);
    expect(creditsEstimate("5", "STRK", 0.1)).toBe(50);
    expect(creditsEstimate("0.01", "ETH", 2500)).toBe(2500);
  });

  test("is unknown without a price, and empty for no amount", () => {
    expect(creditsEstimate("5", "STRK", undefined)).toBeNull();
    expect(creditsEstimate("", "USDC", undefined)).toBeNull();
  });
});
