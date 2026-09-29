import { describe, expect, test } from "bun:test";
import { MIN_TOP_UP_USDC, topUpUsdcFor } from "./amount";

describe("how much to top up for a shortfall", () => {
  test("a shortfall under the minimum still tops up the minimum", () => {
    expect(MIN_TOP_UP_USDC).toBe("1");
    expect(topUpUsdcFor(0)).toBe("1");
    expect(topUpUsdcFor(20)).toBe("1");
    expect(topUpUsdcFor(100)).toBe("1");
  });
  test("a larger shortfall rounds up to the cent", () => {
    expect(topUpUsdcFor(250)).toBe("2.5");
    expect(topUpUsdcFor(251)).toBe("2.51");
    expect(topUpUsdcFor(1000)).toBe("10");
  });
  test("never asks for more than the maximum", () => {
    expect(topUpUsdcFor(10_000_000)).toBe("10000");
  });
  test("a fractional credit count still rounds up", () => {
    expect(topUpUsdcFor(250.2)).toBe("2.51");
  });
});
