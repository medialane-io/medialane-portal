import { test, expect } from "bun:test";
import type { UnlockOutcome } from "./unlock-here";

const OUTCOMES: UnlockOutcome[] = ["unlocked", "not-an-owner", "unavailable", "cancelled"];

test("an account is reached by owning it, so what created the wallet does not matter", () => {
  expect(OUTCOMES).toContain("unlocked");
  expect(OUTCOMES).toContain("not-an-owner");
});

test("no outcome describes where a wallet came from", () => {
  const byOrigin = ["provisioned", "self-custody", "different-wallet", "derived", "sealed"];
  for (const name of byOrigin) {
    expect(OUTCOMES).not.toContain(name as UnlockOutcome);
  }
});

test("a cancelled passkey is not an ownership failure", () => {
  expect(OUTCOMES).toContain("cancelled");
  expect(OUTCOMES).toContain("unavailable");
  expect(OUTCOMES).toHaveLength(4);
});
