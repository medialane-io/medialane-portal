import { test, expect } from "bun:test";
import { labelForAction } from "./spend-labels";

test("known actions read as what a person paid for", () => {
  expect(labelForAction("wallet:deploy")).toBe("Recipient wallets");
  expect(labelForAction("intent:mint")).toBe("Assets issued");
  expect(labelForAction("read")).toBe("API reads");
});

test("an action nobody has labelled still reads as words", () => {
  expect(labelForAction("intent:create-coin")).toBe("Create coin");
  expect(labelForAction("something_new")).toBe("Something new");
});

test("gas is named once, however it was metered", () => {
  expect(labelForAction("paymaster:invoke-build")).toBe("Transaction gas");
  expect(labelForAction("paymaster:invoke-execute")).toBe("Transaction gas");
});
