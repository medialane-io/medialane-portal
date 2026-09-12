export type TaskPhase = "idle" | "running" | "success" | "error";

export const SERVICE_PAUSED = "service_paused";

export function isServicePaused(error: unknown): boolean {
  if (error === SERVICE_PAUSED) return true;
  return error instanceof Error && error.message === SERVICE_PAUSED;
}

export function issuedSummary(count: number, noun = "recipient"): string {
  return `Issued to ${count} ${count === 1 ? noun : `${noun}s`}`;
}
