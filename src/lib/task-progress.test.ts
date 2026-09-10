import { test, expect } from "bun:test";
import { isOutOfCredits, issuedSummary, OUT_OF_CREDITS } from "./task-progress";

test("an out of credits failure is recognised from a thrown error", () => {
  expect(isOutOfCredits(new Error(OUT_OF_CREDITS))).toBe(true);
  expect(isOutOfCredits(OUT_OF_CREDITS)).toBe(true);
});

test("an ordinary failure is not treated as out of credits", () => {
  expect(isOutOfCredits(new Error("network down"))).toBe(false);
  expect(isOutOfCredits(null)).toBe(false);
});

test("the summary reads naturally for one and for many", () => {
  expect(issuedSummary(1)).toBe("Issued to 1 recipient");
  expect(issuedSummary(12)).toBe("Issued to 12 recipients");
});
