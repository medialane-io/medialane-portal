import { test, expect } from "bun:test";
import { describeGuardianStatus, describeRecoveryAction } from "./guardian-status";
import type { GuardianInfo, EscapeInfo } from "@medialane/sdk/starknet";

const GUARDIAN: GuardianInfo = { type: "Starknet", guid: "0xguid", storedValue: "0xabc123" };

test("describeGuardianStatus: no guardians configured", () => {
  expect(describeGuardianStatus([])).toEqual({ kind: "none" });
});

test("describeGuardianStatus: one guardian active", () => {
  expect(describeGuardianStatus([GUARDIAN])).toEqual({ kind: "active", guardian: GUARDIAN });
});

test("describeRecoveryAction: no escape in progress", () => {
  const escape: EscapeInfo = { readyAt: 0, escapeType: "None", status: "None" };
  expect(describeRecoveryAction(escape)).toBe("none");
});

test("describeRecoveryAction: owner escape not ready yet", () => {
  const escape: EscapeInfo = { readyAt: Date.now() / 1000 + 86400, escapeType: "Owner", status: "NotReady" };
  expect(describeRecoveryAction(escape)).toBe("none");
});

test("describeRecoveryAction: owner escape ready to complete", () => {
  const escape: EscapeInfo = { readyAt: 0, escapeType: "Owner", status: "Ready" };
  expect(describeRecoveryAction(escape)).toBe("complete");
});

test("describeRecoveryAction: expired owner escape can be started again", () => {
  const escape: EscapeInfo = { readyAt: 0, escapeType: "Owner", status: "Expired" };
  expect(describeRecoveryAction(escape)).toBe("start");
});

test("describeRecoveryAction: a guardian-type escape is not an owner recovery", () => {
  const escape: EscapeInfo = { readyAt: 0, escapeType: "Guardian", status: "Ready" };
  expect(describeRecoveryAction(escape)).toBe("none");
});
