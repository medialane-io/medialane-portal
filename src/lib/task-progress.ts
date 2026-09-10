export type TaskPhase = "idle" | "running" | "success" | "error";

export const OUT_OF_CREDITS = "out_of_credits";

export function isOutOfCredits(error: unknown): boolean {
  if (error === OUT_OF_CREDITS) return true;
  return error instanceof Error && error.message === OUT_OF_CREDITS;
}

export function issuedSummary(count: number): string {
  return `Issued to ${count} ${count === 1 ? "recipient" : "recipients"}`;
}
