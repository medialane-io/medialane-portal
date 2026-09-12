import { test, expect } from "bun:test";
import {
  quoteIssuance,
  perRecipientPrice,
  fixedPrice,
  formatUsd,
  priceOf,
  type PricingTable,
} from "./issuance-cost";

const pricing: PricingTable = {
  default: 1,
  rules: [
    { actionKey: "wallet:deploy", chain: "ALL", service: "ALL", credits: 5 },
    { actionKey: "intent:mint", chain: "ALL", service: "ALL", credits: 5 },
    { actionKey: "intent:create-tier", chain: "ALL", service: "ALL", credits: 5 },
  ],
};

test("a run is quoted as wallets and assets, one line each", () => {
  const quote = quoteIssuance(pricing, { recipients: 100, service: "ip-club" }, 100);
  expect(quote.lines.map((l) => l.label)).toEqual([
    "Wallets for 100 people",
    "Assets for 100 people",
  ]);
  expect(quote.total).toBeCloseTo(10, 6);
});

test("a ticket run also pays for the ticket type", () => {
  const quote = quoteIssuance(pricing, { recipients: 100, service: "ip-tickets" }, 100);
  expect(quote.lines[0]).toEqual({ label: "Ticket type", usd: 0.05 });
  expect(quote.total).toBeCloseTo(10.05, 6);
});

test("gas, storage and reads are not the customer's line items", () => {
  const labels = quoteIssuance(pricing, { recipients: 5, service: "ip-tickets" }, 100)
    .lines.map((l) => l.label)
    .join(" ");
  for (const internal of ["gas", "transaction", "image", "IPFS", "Prepare"]) {
    expect(labels).not.toContain(internal);
  }
});

test("nothing to issue costs nothing", () => {
  expect(quoteIssuance(pricing, { recipients: 0, service: "ip-club" }, 100)).toEqual({
    lines: [],
    total: 0,
  });
});

test("an unpriced action falls back to the table default", () => {
  expect(priceOf(pricing, "something:new", 100)).toBeCloseTo(0.01, 6);
});

test("the per-person price covers a wallet and an asset", () => {
  expect(perRecipientPrice(pricing, 100)).toBeCloseTo(0.1, 6);
});

test("only a ticket run carries a fixed price", () => {
  expect(fixedPrice(pricing, "ip-tickets", 100)).toBeCloseTo(0.05, 6);
  expect(fixedPrice(pricing, "ip-club", 100)).toBe(0);
});

test("small amounts read as a floor, not as zero", () => {
  expect(formatUsd(0)).toBe("$0");
  expect(formatUsd(0.004)).toBe("under $0.01");
  expect(formatUsd(30.5)).toBe("$30.50");
});
