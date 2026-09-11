import { test, expect } from "bun:test";
import { rateFor, tierRows } from "./mdln-tiers";

test("a rate is what one credit costs at that multiplier", () => {
  expect(rateFor(100, 1)).toBe("$0.010 / credit");
  expect(rateFor(100, 2)).toBe("$0.0050 / credit");
});

test("holding nothing is always the first row", () => {
  expect(tierRows([], 100)[0]).toEqual({
    range: "0 MDLN",
    multiplier: "1.0×",
    rate: "$0.010 / credit",
  });
});

test("tiers read in the order a holder climbs them", () => {
  const rows = tierRows(
    [
      { minWholeTokens: 5000, multiplier: 2 },
      { minWholeTokens: 500, multiplier: 1.2 },
      { minWholeTokens: 2000, multiplier: 1.5 },
    ],
    100,
  );
  expect(rows.map((r) => r.range)).toEqual([
    "0 MDLN",
    "500+ MDLN",
    "2,000+ MDLN",
    "5,000+ MDLN",
  ]);
});

test("a tier granting no discount is not shown as one", () => {
  const rows = tierRows([{ minWholeTokens: 0, multiplier: 1 }], 100);
  expect(rows.length).toBe(1);
});

test("no tiers from the backend still reads honestly", () => {
  expect(tierRows(undefined, 100).length).toBe(1);
});
