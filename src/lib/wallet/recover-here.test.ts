import { test, expect } from "bun:test";
import type { RecoveryOutcome } from "./recover-here";

const OUTCOMES: RecoveryOutcome[] = ["recovered", "not-an-owner", "unavailable", "cancelled"];

test("an account is reached by owning it, so what created the wallet does not matter", () => {
  expect(OUTCOMES).toContain("recovered");
  expect(OUTCOMES).toContain("not-an-owner");
});

test("no outcome describes where a wallet came from", () => {
  const byOrigin = ["provisioned", "self-custody", "different-wallet", "derived", "sealed"];
  for (const name of byOrigin) {
    expect(OUTCOMES).not.toContain(name as RecoveryOutcome);
  }
});

test("a cancelled passkey is not an ownership failure", () => {
  expect(OUTCOMES).toContain("cancelled");
  expect(OUTCOMES).toContain("unavailable");
  expect(OUTCOMES).toHaveLength(4);
});
