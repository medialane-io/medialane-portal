import { test, expect } from "bun:test";
import { usdFromAtomic, formatUsd } from "./quote";

test("atomic USDC reads back as dollars", () => {
  expect(usdFromAtomic("30500000")).toBeCloseTo(30.5, 6);
  expect(usdFromAtomic("10000")).toBeCloseTo(0.01, 6);
});

test("a missing quote is worth nothing, not NaN", () => {
  expect(usdFromAtomic(undefined)).toBe(0);
});

test("small amounts read as a floor, not as zero", () => {
  expect(formatUsd(0)).toBe("$0");
  expect(formatUsd(0.004)).toBe("under $0.01");
  expect(formatUsd(30.5)).toBe("$30.50");
});
