import type { ConfirmResult, LaunchpadRun, RunsClient } from "./runs-client";

export type RunEvent =
  | { kind: "collection" }
  | { kind: "upload"; name: string; done: number; total: number }
  | { kind: "metadata"; done: number; total: number }
  | { kind: "batch"; index: number }
  | { kind: "confirming" }
  | { kind: "done" };

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

export interface ExecutorDeps {
  client: Pick<RunsClient, "get" | "uploadUrl" | "uploaded" | "itemMetadata" | "confirmBatch" | "confirmCollection">;
  sponsored(base: string): Promise<string>;
  putFile(url: string, file: File): Promise<string>;
  wait(ms: number): Promise<void>;
  files: Map<string, File>;
  userAddress: string;
  batchBase(runId: string, index: number): string;
  collectionBase(runId: string): string;
  pollMs?: number;
  maxPolls?: number;
}

async function untilConfirmed(deps: ExecutorDeps, confirm: () => Promise<ConfirmResult>) {
  const maxPolls = deps.maxPolls ?? 60;
  for (let attempt = 0; attempt < maxPolls; attempt++) {
    const result = await confirm();
    if (!result.pending) return result;
    await deps.wait(deps.pollMs ?? 3000);
  }
  throw new StillConfirmingError();
}

export async function executeRun(
  runId: string,
  deps: ExecutorDeps,
  onEvent: (event: RunEvent) => void = () => {},
): Promise<LaunchpadRun> {
  for (let step = 0; step < 10_000; step++) {
    const run = await deps.client.get(runId);
    const next = run.next;
    if (run.status === "COMPLETED" || !next || next.kind === "done") {
      onEvent({ kind: "done" });
      return run;
    }

    switch (next.kind) {
      case "collection":
        onEvent({ kind: "collection" });
        await deps.sponsored(deps.collectionBase(runId));
        break;

      case "wait-collection":
        onEvent({ kind: "confirming" });
        await untilConfirmed(deps, () => deps.client.confirmCollection(runId));
        break;

      case "upload": {
        const missing = next.files.filter((name) => !deps.files.has(name));
        if (missing.length > 0) throw new MissingFilesError(missing);
        let done = 0;
        for (const name of next.files) {
          onEvent({ kind: "upload", name, done, total: next.files.length });
          const url = await deps.client.uploadUrl(runId, name);
          const cid = await deps.putFile(url, deps.files.get(name)!);
          await deps.client.uploaded(runId, name, cid);
          done++;
        }
        break;
      }

      case "metadata": {
        let done = 0;
        for (const index of next.items) {
          onEvent({ kind: "metadata", done, total: next.items.length });
          await deps.client.itemMetadata(runId, index, deps.userAddress);
          done++;
        }
        break;
      }

      case "batch":
        onEvent({ kind: "batch", index: next.index });
        await deps.sponsored(deps.batchBase(runId, next.index));
        break;

      case "wait":
        onEvent({ kind: "confirming" });
        await untilConfirmed(deps, () => deps.client.confirmBatch(runId, next.index));
        break;
    }
  }
  throw new Error("This run did not settle. Refresh to continue from where it stopped.");
}

export async function putFileToSignedUrl(url: string, file: File, fetchImpl: typeof fetch = fetch): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("network", "public");
  form.append("name", file.name);
  const res = await fetchImpl(url, { method: "POST", body: form });
  const body = (await res.json().catch(() => ({}))) as { data?: { cid?: string } };
  const cid = body.data?.cid;
  if (!res.ok || !cid) throw new Error(`Could not upload ${file.name}. Try again.`);
  return cid;
}
