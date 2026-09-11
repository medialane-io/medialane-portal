import { test, expect } from "bun:test";
import { whatItBuys, runwayLine } from "./balance-buys";
import type { PricingTable } from "./issuance-cost";

const pricing: PricingTable = {
  default: 1,
  rules: [
    { actionKey: "wallet:deploy", chain: "ALL", service: "ALL", credits: 5 },
    { actionKey: "intent:create-collection", chain: "ALL", service: "ALL", credits: 25 },
    { actionKey: "intent:create-tier", chain: "ALL", service: "ip-tickets", credits: 50 },
  ],
};

test("a balance is expressed in what it can do", () => {
  expect(whatItBuys(pricing, 100)).toEqual([
    { label: "recipients", count: 20 },
    { label: "collections", count: 4 },
    { label: "ticket types", count: 2 },
  ]);
});

test("what you cannot yet afford is left out", () => {
  expect(whatItBuys(pricing, 28)).toEqual([
    { label: "recipients", count: 5 },
    { label: "collections", count: 1 },
  ]);
});

test("an empty balance buys nothing", () => {
  expect(whatItBuys(pricing, 0)).toEqual([]);
});

test("without pricing nothing is claimed", () => {
  expect(whatItBuys(undefined, 100)).toEqual([]);
});

test("the line reads naturally for one", () => {
  expect(runwayLine([{ label: "recipients", count: 1 }])).toBe("about 1 recipient");
});

test("the line reads naturally for many", () => {
  expect(runwayLine([{ label: "recipients", count: 20 }])).toBe("about 20 recipients");
});

test("nothing affordable means no line rather than a zero", () => {
  expect(runwayLine([])).toBeNull();
});
