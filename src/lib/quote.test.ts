import { test, expect } from "bun:test";
import { usdFromCredits, formatUsd } from "./quote";

test("credits read back as dollars at the platform rate", () => {
  expect(usdFromCredits(3050)).toBeCloseTo(30.5, 6);
  expect(usdFromCredits(1)).toBeCloseTo(0.01, 6);
});

test("nothing costs nothing", () => {
  expect(usdFromCredits(0)).toBe(0);
});

test("small amounts read as a floor, not as zero", () => {
  expect(formatUsd(0)).toBe("$0");
  expect(formatUsd(0.004)).toBe("under $0.01");
  expect(formatUsd(30.5)).toBe("$30.50");
});
