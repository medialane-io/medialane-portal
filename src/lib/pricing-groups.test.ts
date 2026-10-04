import { describe, expect, test } from "bun:test";
import { groupPricing, type PricingRule } from "./pricing-groups";

const rule = (actionKey: string, credits: number, overrides: Partial<PricingRule> = {}): PricingRule => ({
  actionKey,
  chain: "ALL",
  service: "ALL",
  credits,
  ...overrides,
});

describe("grouping the live price list", () => {
  test("splits run actions from API actions, in a fixed order, with readable labels", () => {
    const { runs, api } = groupPricing([rule("intent:mint", 5), rule("read", 1), rule("intent:create-collection", 5), rule("intent:offer", 2)]);
    expect(runs.map((r) => r.label)).toEqual(["Create a collection", "Mint an item"]);
    expect(api.map((r) => r.label)).toEqual(["Read or query", "Make an offer"]);
    expect(runs[1]).toEqual({ actionKey: "intent:mint", label: "Mint an item", credits: 5 });
  });

  test("only the default rule counts, never a per-chain or per-service override", () => {
    const { runs } = groupPricing([rule("intent:mint", 5), rule("intent:mint", 9, { chain: "STARKNET" }), rule("intent:mint", 7, { service: "pop-protocol" })]);
    expect(runs).toEqual([{ actionKey: "intent:mint", label: "Mint an item", credits: 5 }]);
  });

  test("actions that are not sold are hidden, and unknown actions are left out", () => {
    const { runs, api } = groupPricing([rule("paymaster:invoke", 1), rule("launchpad:refund", -3), rule("something:new", 4)]);
    expect(runs).toEqual([]);
    expect(api).toEqual([]);
  });

  test("an unavailable price list gives empty groups", () => {
    expect(groupPricing(undefined)).toEqual({ runs: [], api: [] });
  });
});
