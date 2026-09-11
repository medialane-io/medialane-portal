import { test, expect } from "bun:test";
import { labelForAction, groupSpend, shareOf } from "./spend-labels";

test("an action a business recognises reads as plain words", () => {
  expect(labelForAction("wallet:deploy")).toBe("Recipient wallets");
  expect(labelForAction("intent:create-tier")).toBe("Tickets created");
});

test("an action nobody has labelled yet still reads as words", () => {
  expect(labelForAction("intent:launch-coin")).toBe("Launch coin");
  expect(labelForAction("swap:quote")).toBe("Quote");
});

test("building and sending a transaction are one line to the reader", () => {
  const groups = groupSpend([
    { actionKey: "paymaster:invoke-build", credits: 4, units: 4 },
    { actionKey: "paymaster:invoke-execute", credits: 20, units: 4 },
  ]);
  expect(groups).toEqual([{ label: "Transaction gas", credits: 24, units: 8 }]);
});

test("the biggest line comes first", () => {
  const groups = groupSpend([
    { actionKey: "read", credits: 3, units: 3 },
    { actionKey: "wallet:deploy", credits: 50, units: 10 },
    { actionKey: "metadata:upload-json", credits: 5, units: 1 },
  ]);
  expect(groups.map((g) => g.label)).toEqual(["Recipient wallets", "Details stored", "API reads"]);
});

test("nothing spent groups to nothing", () => {
  expect(groupSpend([])).toEqual([]);
});

test("a share of a total is a fraction", () => {
  expect(shareOf(25, 100)).toBe(0.25);
});

test("a share of nothing is nothing rather than an error", () => {
  expect(shareOf(0, 0)).toBe(0);
});
