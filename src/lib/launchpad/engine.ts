import type { ConfirmResult, LaunchpadRun, RunStatus } from "@medialane/sdk";

const MAX_STEPS = 10_000;

export class MissingFilesError extends Error {
  constructor(readonly files: string[]) {
    super(`Attach ${files.join(", ")} to continue`);
  }
}

export class StillConfirmingError extends Error {
  constructor() {
    super("Your last step is still being confirmed. Come back in a few minutes to continue.");
  }
}

export class RunAbortedError extends Error {
  constructor() {
    super("This run was paused. Continue to pick up where it left off.");
  }
}

export interface PollDeps {
  wait(ms: number): Promise<void>;
  pollMs?: number;
  maxPolls?: number;
  signal?: AbortSignal;
}

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new RunAbortedError();
}

export async function untilConfirmed(deps: PollDeps, confirm: () => Promise<ConfirmResult>) {
  const maxPolls = deps.maxPolls ?? 60;
  for (let attempt = 0; attempt < maxPolls; attempt++) {
    throwIfAborted(deps.signal);
    const result = await confirm();
    if (!result.pending) return result;
    await deps.wait(deps.pollMs ?? 3000);
  }
  throw new StillConfirmingError();
}

type Pending = { kind: string };

export type StepTable<N extends Pending> = {
  [K in Exclude<N["kind"], "done">]: (next: Extract<N, { kind: K }>, runId: string) => Promise<void>;
};

export interface EngineOptions<R extends LaunchpadRun, N extends Pending> {
  runId: string;
  load(runId: string): Promise<LaunchpadRun>;
  owns(run: LaunchpadRun): run is R;
  steps: StepTable<N>;
  onDone(): void;
  signal?: AbortSignal;
}

export async function runEngine<R extends LaunchpadRun & { status: RunStatus; next?: N }, N extends Pending>({
  runId,
  load,
  owns,
  steps,
  onDone,
  signal,
}: EngineOptions<R, N>): Promise<R> {
  for (let step = 0; step < MAX_STEPS; step++) {
    throwIfAborted(signal);
    const run = await load(runId);
    if (!owns(run)) throw new Error("This run belongs to a different service.");
    const next = run.next;
    if (run.status === "COMPLETED" || !next || next.kind === "done") {
      onDone();
      return run;
    }
    const handler = steps[next.kind as keyof typeof steps] as (n: N, id: string) => Promise<void>;
    await handler(next, runId);
  }
  throw new Error("This run did not settle. Refresh to continue from where it stopped.");
}

export interface WalletsStepOptions<T> {
  resolve(runId: string): Promise<T[]>;
  register(runId: string, recipient: T): Promise<unknown>;
  onProgress(done: number, total: number): void;
  stalledMessage: string;
  pace?: () => Promise<void>;
}

export function walletsStep<T>(options: WalletsStepOptions<T>) {
  let resolvedOnce = false;
  return async (_next: unknown, runId: string) => {
    const pending = await options.resolve(runId);
    if (pending.length === 0 && resolvedOnce) throw new Error(options.stalledMessage);
    resolvedOnce = pending.length === 0;
    for (const [done, recipient] of pending.entries()) {
      options.onProgress(done, pending.length);
      await options.pace?.();
      await options.register(runId, recipient);
    }
  };
}
