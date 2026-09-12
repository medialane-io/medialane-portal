import { test, expect } from "bun:test";
import { isServicePaused, issuedSummary, SERVICE_PAUSED } from "./task-progress";

test("an out of credits failure is recognised from a thrown error", () => {
  expect(isServicePaused(new Error(SERVICE_PAUSED))).toBe(true);
  expect(isServicePaused(SERVICE_PAUSED)).toBe(true);
});

test("an ordinary failure is not treated as out of credits", () => {
  expect(isServicePaused(new Error("network down"))).toBe(false);
  expect(isServicePaused(null)).toBe(false);
});

test("the summary reads naturally for one and for many", () => {
  expect(issuedSummary(1)).toBe("Issued to 1 recipient");
  expect(issuedSummary(12)).toBe("Issued to 12 recipients");
  expect(issuedSummary(1, "guest")).toBe("Issued to 1 guest");
  expect(issuedSummary(12, "guest")).toBe("Issued to 12 guests");
});
