import type { ConfirmResult } from "@medialane/sdk";
import { MissingFilesError, untilConfirmed, type PollDeps } from "./engine";

export type SharedEvent = { kind: "collection" } | { kind: "batch"; index: number } | { kind: "confirming" };

export interface SharedStepOptions {
  deps: PollDeps & { sponsored(base: string): Promise<string> };
  emit(event: SharedEvent): void;
  collectionBase(runId: string): string;
  batchBase(runId: string, index: number): string;
  confirmCollection(runId: string): Promise<ConfirmResult>;
  confirmBatch(runId: string, index: number): Promise<ConfirmResult>;
  pace?: () => Promise<void>;
}

export function sharedSteps({ deps, emit, pace, ...o }: SharedStepOptions) {
  const confirm = async (check: () => Promise<ConfirmResult>) => {
    emit({ kind: "confirming" });
    await untilConfirmed(deps, check);
  };

  return {
    confirm,
    collection: async (_next: unknown, id: string) => {
      emit({ kind: "collection" });
      await deps.sponsored(o.collectionBase(id));
    },
    "wait-collection": (_next: unknown, id: string) => confirm(() => o.confirmCollection(id)),
    batch: async (next: { index: number }, id: string) => {
      emit({ kind: "batch", index: next.index });
      await pace?.();
      await deps.sponsored(o.batchBase(id, next.index));
    },
    wait: (next: { index: number }, id: string) => confirm(() => o.confirmBatch(id, next.index)),
  };
}

export interface ArtworkUploadOptions {
  artwork: File | null;
  client: {
    uploadUrl(runId: string, name: string): Promise<string>;
    uploaded(runId: string, name: string, cid: string): Promise<unknown>;
  };
  putFile(url: string, file: File): Promise<string>;
  emit(event: { kind: "upload"; name: string }): void;
}

export function artworkUploadStep({ artwork, client, putFile, emit }: ArtworkUploadOptions) {
  return async (next: { files: string[] }, id: string) => {
    const name = next.files[0]!;
    if (!artwork) throw new MissingFilesError(next.files);
    emit({ kind: "upload", name });
    const url = await client.uploadUrl(id, name);
    const cid = await putFile(url, artwork);
    await client.uploaded(id, name, cid);
  };
}
