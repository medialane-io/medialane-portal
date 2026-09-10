import { test, expect } from "bun:test";
import { estimateIssuance, costOf, shortfall, type PricingTable } from "./issuance-cost";

const pricing: PricingTable = {
  default: 1,
  rules: [
    { actionKey: "read", chain: "ALL", service: "ALL", credits: 1 },
    { actionKey: "metadata:upload-file", chain: "ALL", service: "ALL", credits: 15 },
    { actionKey: "metadata:upload-json", chain: "ALL", service: "ALL", credits: 5 },
    { actionKey: "intent:create-tier", chain: "ALL", service: "ip-club", credits: 50 },
  ],
};

test("a service specific price wins over the general one", () => {
  expect(costOf(pricing, "intent:create-tier", "ip-club")).toBe(50);
});

test("an unpriced action falls back to the default", () => {
  expect(costOf(pricing, "something:new")).toBe(1);
});

test("no pricing yet costs nothing rather than guessing", () => {
  expect(costOf(undefined, "read")).toBe(0);
});

test("a single recipient with an image is itemised", () => {
  const { lines, total } = estimateIssuance(pricing, { recipients: 1, hasImage: true, service: "x" });
  expect(lines.map((l) => l.credits)).toEqual([1, 15, 5, 1]);
  expect(total).toBe(22);
});

test("without an image the storage line disappears", () => {
  const { lines, total } = estimateIssuance(pricing, { recipients: 1, hasImage: false, service: "x" });
  expect(lines.length).toBe(3);
  expect(total).toBe(7);
});

test("cost grows with the number of recipients", () => {
  const ten = estimateIssuance(pricing, { recipients: 10, hasImage: true, service: "x" });
  const hundred = estimateIssuance(pricing, { recipients: 100, hasImage: true, service: "x" });
  expect(ten.total).toBe(31);
  expect(hundred.total).toBe(121);
});

test("the recipient line reads naturally for one and for many", () => {
  expect(estimateIssuance(pricing, { recipients: 1, hasImage: false, service: "x" }).lines[0].label)
    .toBe("Prepare 1 recipient");
  expect(estimateIssuance(pricing, { recipients: 4, hasImage: false, service: "x" }).lines[0].label)
    .toBe("Prepare 4 recipients");
});

test("no recipients means nothing to estimate", () => {
  expect(estimateIssuance(pricing, { recipients: 0, hasImage: true, service: "x" }).total).toBe(0);
});

test("a shortfall is what you still need", () => {
  expect(shortfall(120, 83)).toBe(37);
});

test("enough credits leaves no shortfall", () => {
  expect(shortfall(20, 83)).toBe(0);
});

test("an unknown balance is not reported as a shortfall", () => {
  expect(shortfall(120, undefined)).toBe(0);
});
