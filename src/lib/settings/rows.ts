export type RowTone = "ok" | "warn" | "muted";

export interface RowStatus {
  value: string;
  tone: RowTone;
}

export interface EmailStatus {
  email: string | null;
  verified: boolean;
}

export function emailRow(status: EmailStatus | null): RowStatus | null {
  if (!status) return null;
  if (!status.email) return { value: "Not set", tone: "warn" };
  return status.verified ? { value: "Confirmed", tone: "ok" } : { value: "Not confirmed", tone: "warn" };
}

export function walletRow(isDeployed: boolean | null): RowStatus | undefined {
  return isDeployed === false ? { value: "Setting up", tone: "warn" } : undefined;
}

export function recoveryRow(state: "unknown" | "ready" | "missing"): RowStatus | undefined {
  if (state === "ready") return { value: "Ready", tone: "ok" };
  if (state === "missing") return { value: "Not set up", tone: "warn" };
  return undefined;
}
