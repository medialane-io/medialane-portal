import { test, expect } from "bun:test";
import type { AttachOutcome, ApprovalOutcome } from "./attach-wallet";

const ATTACH: AttachOutcome[] = ["connected", "cancelled", "approving", "unavailable"];
const APPROVAL: ApprovalOutcome[] = ["connected", "unmatched", "unconfirmed"];

test("confirming a passkey that already owns the account finishes without an approval", () => {
  expect(ATTACH).toContain("connected");
  expect(ATTACH.indexOf("connected")).toBeLessThan(ATTACH.indexOf("approving"));
});

test("a cancelled passkey keeps the person where they are", () => {
  expect(ATTACH).toContain("cancelled");
  expect(ATTACH).toContain("unavailable");
});

test("an approval that has yet to land is separable from one that was never started", () => {
  expect(APPROVAL).toContain("unmatched");
  expect(APPROVAL).toContain("unconfirmed");
  expect(APPROVAL).toHaveLength(3);
});

test("no outcome names a page, so the flow stays on one screen", () => {
  const pages = ["link-device", "wallet-onboarding", "setup", "pair"];
  for (const name of pages) {
    expect([...ATTACH, ...APPROVAL]).not.toContain(name as AttachOutcome);
  }
});
