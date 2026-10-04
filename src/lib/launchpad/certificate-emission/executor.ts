import { runEngine, walletsStep, type PollDeps } from "@/lib/launchpad/engine";
import { artworkUploadStep, sharedSteps } from "@/lib/launchpad/steps";
import {
  isCertificateEmissionRun,
  type CertificateEmissionNextStep,
  type CertificateEmissionRun,
  type LaunchpadRunsClient,
} from "@medialane/sdk";

export type CertificateEmissionEvent =
  | { kind: "collection" }
  | { kind: "upload"; name: string }
  | { kind: "certificate-metadata" }
  | { kind: "wallets"; done: number; total: number }
  | { kind: "batch"; index: number }
  | { kind: "confirming" }
  | { kind: "done" };

export function describeCertificateEvent(event: CertificateEmissionEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new collection in your wallet";
    case "upload":
      return "Uploading artwork";
    case "certificate-metadata":
      return "Preparing certificate";
    case "wallets":
      return `Preparing recipient ${event.done + 1} of ${event.total}`;
    case "batch":
      return `Confirm certificates ${event.index + 1} in your wallet`;
    case "confirming":
      return "Waiting for confirmation";
    case "done":
      return "Done";
  }
}

export function transactionPacingMs(minMs = 1000, maxMs = 10000): number {
  return minMs + Math.random() * (maxMs - minMs);
}

export interface CertificateEmissionExecutorDeps extends PollDeps {
  userAddress: string;
  client: Pick<LaunchpadRunsClient, "get"> &
    Pick<
      LaunchpadRunsClient["certificateEmission"],
      "uploadUrl" | "uploaded" | "metadata" | "resolveWallets" | "registerWallet" | "confirmCollection" | "confirmBatch"
    >;
  sponsored(base: string): Promise<string>;
  putFile(url: string, file: File): Promise<string>;
  artwork: File | null;
  collectionBase(runId: string): string;
  batchBase(runId: string, index: number): string;
}

export function executeCertificateEmissionRun(
  runId: string,
  deps: CertificateEmissionExecutorDeps,
  onEvent: (event: CertificateEmissionEvent) => void = () => {},
): Promise<CertificateEmissionRun> {
  const pace = () => deps.wait(transactionPacingMs());

  return runEngine<CertificateEmissionRun, CertificateEmissionNextStep>({
    runId,
    load: deps.client.get,
    owns: isCertificateEmissionRun,
    signal: deps.signal,
    onDone: () => onEvent({ kind: "done" }),
    steps: {
      ...sharedSteps({
        deps,
        emit: onEvent,
        pace,
        collectionBase: deps.collectionBase,
        batchBase: deps.batchBase,
        confirmCollection: deps.client.confirmCollection,
        confirmBatch: deps.client.confirmBatch,
      }),
      upload: artworkUploadStep({ artwork: deps.artwork, client: deps.client, putFile: deps.putFile, emit: onEvent }),
      "certificate-metadata": async (_next, id) => {
        onEvent({ kind: "certificate-metadata" });
        await deps.client.metadata(id, deps.userAddress);
      },
      wallets: walletsStep({
        resolve: deps.client.resolveWallets,
        register: (id, recipient) => deps.client.registerWallet(id, { recipient }),
        onProgress: (done, total) => onEvent({ kind: "wallets", done, total }),
        stalledMessage: "A recipient's wallet is still being prepared. Try again in a moment.",
        pace,
      }),
    },
  });
}

export const certificateEmissionApi = (client: LaunchpadRunsClient) => ({ get: client.get, ...client.certificateEmission });
