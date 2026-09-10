import { test, expect } from "bun:test";
import { stepStates, isOutOfCredits, issuedSummary, OUT_OF_CREDITS } from "./task-progress";

const LABELS = ["Prepare recipients", "Upload the asset", "Sign and issue"];

test("nothing is active before the task starts", () => {
  expect(stepStates(LABELS, 0, "idle").map((s) => s.state)).toEqual(["pending", "pending", "pending"]);
});

test("the current step is active and earlier ones are done", () => {
  expect(stepStates(LABELS, 1, "running").map((s) => s.state)).toEqual(["done", "active", "pending"]);
});

test("the first step is active at the start of a run", () => {
  expect(stepStates(LABELS, 0, "running").map((s) => s.state)).toEqual(["active", "pending", "pending"]);
});

test("success marks every step done", () => {
  expect(stepStates(LABELS, 1, "success").map((s) => s.state)).toEqual(["done", "done", "done"]);
});

test("a failure leaves the failed step un-done so it is visible where it stopped", () => {
  expect(stepStates(LABELS, 1, "error").map((s) => s.state)).toEqual(["done", "pending", "pending"]);
});

test("labels are preserved in order", () => {
  expect(stepStates(LABELS, 0, "running").map((s) => s.label)).toEqual(LABELS);
});

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
