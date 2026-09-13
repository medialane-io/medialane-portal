export type TaskPhase = "idle" | "running" | "success" | "error";

export function issuedSummary(count: number, noun = "recipient"): string {
  return `Issued to ${count} ${count === 1 ? noun : `${noun}s`}`;
}
