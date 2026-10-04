import { runEngine, walletsStep, type PollDeps } from "@/lib/launchpad/engine";
import { artworkUploadStep, pacedBy, sharedSteps } from "@/lib/launchpad/steps";
import {
  isTicketingRun,
  type LaunchpadRunsClient,
  type TicketingNextStep,
  type TicketingRun,
} from "@medialane/sdk";

export type TicketingEvent =
  | { kind: "collection" }
  | { kind: "upload"; name: string }
  | { kind: "ticket-metadata" }
  | { kind: "tier" }
  | { kind: "wallets"; done: number; total: number }
  | { kind: "batch"; index: number }
  | { kind: "confirming" }
  | { kind: "done" };

export function describeTicketingEvent(event: TicketingEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new group in your wallet";
    case "upload":
      return "Uploading artwork";
    case "ticket-metadata":
      return "Preparing ticket";
    case "tier":
      return "Confirm ticket in your wallet";
    case "wallets":
      return `Preparing guest ${event.done + 1} of ${event.total}`;
    case "batch":
      return `Confirm tickets ${event.index + 1} in your wallet`;
    case "confirming":
      return "Waiting for confirmation";
    case "done":
      return "Done";
  }
}

export interface TicketingExecutorDeps extends PollDeps {
  userAddress: string;
  client: Pick<LaunchpadRunsClient, "get"> &
    Pick<
      LaunchpadRunsClient["ticketing"],
      "uploadUrl" | "uploaded" | "metadata" | "resolveWallets" | "registerWallet" | "confirmCollection" | "confirmTier" | "confirmBatch"
    >;
  sponsored(base: string): Promise<string>;
  putFile(url: string, file: File): Promise<string>;
  artwork: File | null;
  collectionBase(runId: string): string;
  tierBase(runId: string): string;
  batchBase(runId: string, index: number): string;
}

export function executeTicketingRun(
  runId: string,
  deps: TicketingExecutorDeps,
  onEvent: (event: TicketingEvent) => void = () => {},
): Promise<TicketingRun> {
  const { confirm, ...shared } = sharedSteps({
    deps,
    emit: onEvent,
    collectionBase: deps.collectionBase,
    batchBase: deps.batchBase,
    confirmCollection: deps.client.confirmCollection,
    confirmBatch: deps.client.confirmBatch,
  });

  return runEngine<TicketingRun, TicketingNextStep>({
    runId,
    load: deps.client.get,
    owns: isTicketingRun,
    signal: deps.signal,
    onDone: () => onEvent({ kind: "done" }),
    steps: {
      ...shared,
      upload: artworkUploadStep({ artwork: deps.artwork, client: deps.client, putFile: deps.putFile, emit: onEvent }),
      "ticket-metadata": async (_next, id) => {
        onEvent({ kind: "ticket-metadata" });
        await deps.client.metadata(id, deps.userAddress);
      },
      tier: async (_next, id) => {
        onEvent({ kind: "tier" });
        await pacedBy(deps)();
        await deps.sponsored(deps.tierBase(id));
      },
      "wait-tier": (_next, id) => confirm(() => deps.client.confirmTier(id)),
      wallets: walletsStep({
        resolve: deps.client.resolveWallets,
        register: (id, recipient) => deps.client.registerWallet(id, { recipient }),
        onProgress: (done, total) => onEvent({ kind: "wallets", done, total }),
        stalledMessage: "A guest's wallet is still being prepared. Try again in a moment.",
        pace: pacedBy(deps),
      }),
    },
  });
}

export const ticketingApi = (client: LaunchpadRunsClient) => ({ get: client.get, ...client.ticketing });
