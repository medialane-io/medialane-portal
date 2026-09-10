export type TaskPhase = "idle" | "running" | "success" | "error";

export type StepState = "pending" | "active" | "done";

export interface TaskStep {
  label: string;
  state: StepState;
}

export function stepStates(labels: readonly string[], activeIndex: number, phase: TaskPhase): TaskStep[] {
  return labels.map((label, i) => {
    if (phase === "success") return { label, state: "done" as const };
    if (i < activeIndex) return { label, state: "done" as const };
    if (i === activeIndex && phase === "running") return { label, state: "active" as const };
    return { label, state: "pending" as const };
  });
}

export const OUT_OF_CREDITS = "out_of_credits";

export function isOutOfCredits(error: unknown): boolean {
  if (error === OUT_OF_CREDITS) return true;
  return error instanceof Error && error.message === OUT_OF_CREDITS;
}

export function issuedSummary(count: number): string {
  return `Issued to ${count} ${count === 1 ? "recipient" : "recipients"}`;
}
