import { test, expect } from "bun:test";
import { estimateIssuance, costOf, shortfall, dollarsFor, formatDollars, perRecipientCost, fixedCost, type PricingTable } from "./issuance-cost";

const pricing: PricingTable = {
  default: 1,
  rules: [
    { actionKey: "read", chain: "ALL", service: "ALL", credits: 1 },
    { actionKey: "wallet:deploy", chain: "ALL", service: "ALL", credits: 10 },
    { actionKey: "metadata:upload-file", chain: "ALL", service: "ALL", credits: 15 },
    { actionKey: "metadata:upload-json", chain: "ALL", service: "ALL", credits: 5 },
    { actionKey: "intent:create-tier", chain: "ALL", service: "ip-club", credits: 50 },
    { actionKey: "intent:create-tier", chain: "ALL", service: "ip-tickets", credits: 50 },
    { actionKey: "paymaster:invoke-build", chain: "ALL", service: "ALL", credits: 1 },
    { actionKey: "paymaster:invoke-execute", chain: "ALL", service: "ALL", credits: 5 },
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
  expect(lines.map((l) => l.credits)).toEqual([10, 15, 5, 1, 6]);
  expect(total).toBe(37);
});

test("without an image the storage line disappears", () => {
  const { lines, total } = estimateIssuance(pricing, { recipients: 1, hasImage: false, service: "x" });
  expect(lines.length).toBe(4);
  expect(total).toBe(22);
});

test("cost grows with the number of recipients", () => {
  const ten = estimateIssuance(pricing, { recipients: 10, hasImage: true, service: "x" });
  const hundred = estimateIssuance(pricing, { recipients: 100, hasImage: true, service: "x" });
  expect(ten.total).toBe(127);
  expect(hundred.total).toBe(1045);
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

test("preparing a recipient is priced as a wallet deployment", () => {
  const one = estimateIssuance(pricing, { recipients: 1, hasImage: false, service: "x" });
  expect(one.lines[0].credits).toBe(10);
});

test("enough credits leaves no shortfall", () => {
  expect(shortfall(20, 83)).toBe(0);
});

test("an unknown balance is not reported as a shortfall", () => {
  expect(shortfall(120, undefined)).toBe(0);
});

test("issuing tickets includes creating the ticket itself", () => {
  const { lines, total } = estimateIssuance(pricing, { recipients: 2, hasImage: false, service: "ip-tickets" });
  expect(lines.map((l) => l.label)).toContain("Create the ticket");
  expect(total).toBe(20 + 5 + 50 + 1 + 12);
});

test("tokenizing data has no ticket to create", () => {
  const { lines } = estimateIssuance(pricing, { recipients: 2, hasImage: false, service: "data-tokenization-erc721" });
  expect(lines.map((l) => l.label)).not.toContain("Create the ticket");
});

test("credits convert to dollars at the published rate", () => {
  expect(dollarsFor(100, 100)).toBe(1);
  expect(dollarsFor(76, 100)).toBe(0.76);
});

test("a price reads as money", () => {
  expect(formatDollars(1)).toBe("$1.00");
  expect(formatDollars(0.76)).toBe("$0.76");
  expect(formatDollars(0)).toBe("$0");
});

test("a fraction of a cent is not rounded away to nothing", () => {
  expect(formatDollars(0.004)).toBe("under $0.01");
});

test("the cost of one more recipient is separable from the rest", () => {
  expect(perRecipientCost(pricing, "ip-tickets")).toBe(10);
});

test("what a run costs before anyone is added is separable", () => {
  expect(fixedCost(pricing, { hasImage: true, service: "ip-tickets" })).toBe(15 + 5 + 50 + 1 + 12);
  expect(fixedCost(pricing, { hasImage: false, service: "data-tokenization-erc721" })).toBe(5 + 1 + 6);
});

test("gas is charged per transaction, and mints batch at twenty five", () => {
  const one = estimateIssuance(pricing, { recipients: 25, hasImage: false, service: "x" });
  const two = estimateIssuance(pricing, { recipients: 26, hasImage: false, service: "x" });
  expect(one.lines.at(-1)).toEqual({ label: "Cover gas on 1 transaction", credits: 6 });
  expect(two.lines.at(-1)).toEqual({ label: "Cover gas on 2 transactions", credits: 12 });
});

test("a ticket run pays gas for creating the ticket as well as the mints", () => {
  const { lines } = estimateIssuance(pricing, { recipients: 25, hasImage: false, service: "ip-tickets" });
  expect(lines.at(-1)).toEqual({ label: "Cover gas on 2 transactions", credits: 12 });
});
