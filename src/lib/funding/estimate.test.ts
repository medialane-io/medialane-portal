import { describe, expect, test } from "bun:test";
import { tokenAmountEstimate } from "./estimate";

describe("about how much of a token a dollar amount is", () => {
  test("USDC is the dollars themselves, without a price", () => {
    expect(tokenAmountEstimate(111, "USDC", undefined)).toBe("111");
    expect(tokenAmountEstimate(0.5, "USDC", undefined)).toBe("0.5");
  });

  test("ETH is the dollars divided by its price", () => {
    expect(tokenAmountEstimate(111, "ETH", 2696)).toBe("0.0412");
    expect(tokenAmountEstimate(0.5, "ETH", 2696)).toBe("0.000185");
  });

  test("a token worth cents shows a readable count", () => {
    expect(tokenAmountEstimate(111, "STRK", 0.043)).toBe("2,581");
    expect(tokenAmountEstimate(1.5, "STRK", 0.043)).toBe("34.88");
  });

  test("the same dollars give a different amount for a different token", () => {
    const usdc = tokenAmountEstimate(111, "USDC", undefined);
    const eth = tokenAmountEstimate(111, "ETH", 2696);
    const strk = tokenAmountEstimate(111, "STRK", 0.043);
    expect(new Set([usdc, eth, strk]).size).toBe(3);
  });

  test("nothing to show without a price, or without an amount", () => {
    expect(tokenAmountEstimate(111, "ETH", undefined)).toBeNull();
    expect(tokenAmountEstimate(0, "ETH", 2696)).toBeNull();
    expect(tokenAmountEstimate(Number.NaN, "USDC", undefined)).toBeNull();
    expect(tokenAmountEstimate(5, "ETH", 0)).toBeNull();
  });
});
