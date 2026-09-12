import type { GuardianInfo, EscapeInfo } from "@medialane/sdk/starknet";

export type GuardianStatus = { kind: "none" } | { kind: "active"; guardian: GuardianInfo };

export function describeGuardianStatus(guardians: GuardianInfo[]): GuardianStatus {
  if (guardians.length === 0) return { kind: "none" };
  return { kind: "active", guardian: guardians[0] };
}

export type RecoveryAction = "start" | "complete" | "none";

export function describeRecoveryAction(escape: EscapeInfo): RecoveryAction {
  if (escape.escapeType !== "Owner") return "none";
  if (escape.status === "Ready") return "complete";
  if (escape.status === "Expired") return "start";
  return "none";
}
