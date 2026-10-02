import { MissingFilesError, untilConfirmed, type ExecutorDeps } from "@/lib/launchpad/run-executor";
import {
  isCertificateEmissionRun,
  type ConfirmResult,
  type LaunchpadRun,
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

export function transactionPacingMs(minMs = 1000, maxMs = 10000): number {
  return minMs + Math.random() * (maxMs - minMs);
}

export interface CertificateEmissionExecutorDeps extends Pick<ExecutorDeps, "wait" | "pollMs" | "maxPolls" | "userAddress"> {
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

export async function executeCertificateEmissionRun(
  runId: string,
  deps: CertificateEmissionExecutorDeps,
  onEvent: (event: CertificateEmissionEvent) => void = () => {},
): Promise<LaunchpadRun> {
  const waitFor = (confirm: () => Promise<ConfirmResult>) => {
    onEvent({ kind: "confirming" });
    return untilConfirmed(deps, confirm);
  };

  let walletsResolved = false;
  for (let step = 0; step < 10_000; step++) {
    const run = await deps.client.get(runId);
    if (!isCertificateEmissionRun(run)) throw new Error("This run belongs to a different service.");
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
        await waitFor(() => deps.client.confirmCollection(runId));
        break;

      case "upload": {
        const name = next.files[0]!;
        if (!deps.artwork) throw new MissingFilesError(next.files);
        onEvent({ kind: "upload", name });
        const url = await deps.client.uploadUrl(runId, name);
        const cid = await deps.putFile(url, deps.artwork);
        await deps.client.uploaded(runId, name, cid);
        break;
      }

      case "certificate-metadata":
        onEvent({ kind: "certificate-metadata" });
        await deps.client.metadata(runId, deps.userAddress);
        break;

      case "wallets": {
        const pending = await deps.client.resolveWallets(runId);
        if (pending.length === 0 && walletsResolved) {
          throw new Error("A recipient's wallet is still being prepared. Try again in a moment.");
        }
        walletsResolved = pending.length === 0;
        for (const [done, recipient] of pending.entries()) {
          onEvent({ kind: "wallets", done, total: pending.length });
          await deps.wait(transactionPacingMs());
          await deps.client.registerWallet(runId, { recipient });
        }
        break;
      }

      case "batch":
        onEvent({ kind: "batch", index: next.index });
        await deps.wait(transactionPacingMs());
        await deps.sponsored(deps.batchBase(runId, next.index));
        break;

      case "wait":
        await waitFor(() => deps.client.confirmBatch(runId, next.index));
        break;
    }
  }
  throw new Error("This run did not settle. Refresh to continue from where it stopped.");
}
