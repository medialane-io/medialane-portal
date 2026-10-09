import {
  isDataTokenizationRun,
  type DataTokenizationRun,
  type LaunchpadRunsClient,
  type NextStep,
} from "@medialane/sdk";
import { MissingFilesError, runEngine, throwIfAborted, walletsStep, type PollDeps } from "@/lib/launchpad/engine";
import { pacedBy, sharedSteps } from "@/lib/launchpad/steps";

export type RunEvent =
  | { kind: "collection" }
  | { kind: "upload"; name: string; done: number; total: number }
  | { kind: "metadata"; done: number; total: number }
  | { kind: "wallets"; done: number; total: number }
  | { kind: "batch"; index: number }
  | { kind: "confirming" }
  | { kind: "done" };

export function describeRunEvent(event: RunEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new collection in your wallet";
    case "upload":
      return `Uploading ${event.name} (${event.done + 1} of ${event.total})`;
    case "metadata":
      return `Recording details (${event.done + 1} of ${event.total})`;
    case "wallets":
      return `Preparing guest ${event.done + 1} of ${event.total}`;
    case "batch":
      return `Confirm batch ${event.index + 1} in your wallet`;
    case "confirming":
      return "Waiting for confirmation";
    case "done":
      return "Done";
  }
}

export interface ExecutorDeps extends PollDeps {
  client: Pick<
    LaunchpadRunsClient,
    "get" | "uploadUrl" | "uploaded" | "itemMetadata" | "confirmBatch" | "confirmCollection" | "resolveGuests" | "registerGuest"
  >;
  sponsored(base: string): Promise<string>;
  putFile(url: string, file: File): Promise<string>;
  files: Map<string, File>;
  userAddress: string;
  batchBase(runId: string, index: number): string;
  collectionBase(runId: string): string;
}

export function executeRun(
  runId: string,
  deps: ExecutorDeps,
  onEvent: (event: RunEvent) => void = () => {},
): Promise<DataTokenizationRun> {
  return runEngine<DataTokenizationRun, NextStep>({
    runId,
    load: deps.client.get,
    owns: isDataTokenizationRun,
    signal: deps.signal,
    onDone: () => onEvent({ kind: "done" }),
    steps: {
      ...sharedSteps({
        deps,
        emit: onEvent,
        collectionBase: deps.collectionBase,
        batchBase: deps.batchBase,
        confirmCollection: deps.client.confirmCollection,
        confirmBatch: deps.client.confirmBatch,
      }),
      upload: async (next, id) => {
        const missing = next.files.filter((name) => !deps.files.has(name));
        if (missing.length > 0) throw new MissingFilesError(missing);
        for (const [done, name] of next.files.entries()) {
          throwIfAborted(deps.signal);
          onEvent({ kind: "upload", name, done, total: next.files.length });
          const url = await deps.client.uploadUrl(id, name);
          const cid = await deps.putFile(url, deps.files.get(name)!);
          await deps.client.uploaded(id, name, cid);
        }
      },
      metadata: async (next, id) => {
        for (const [done, index] of next.items.entries()) {
          throwIfAborted(deps.signal);
          onEvent({ kind: "metadata", done, total: next.items.length });
          await deps.client.itemMetadata(id, index, deps.userAddress);
        }
      },
      wallets: walletsStep({
        resolve: deps.client.resolveGuests,
        register: (id, recipient) => deps.client.registerGuest(id, { recipient }),
        onProgress: (done, total) => onEvent({ kind: "wallets", done, total }),
        stalledMessage: "A guest's wallet is still being prepared. Try again in a moment.",
        pace: pacedBy(deps),
      }),
    },
  });
}
