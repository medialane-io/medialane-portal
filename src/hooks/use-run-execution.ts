"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { executeSponsored, type TypedDataSigner } from "@medialane/sdk/starknet";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import type { LaunchpadRun, LaunchpadRunsClient } from "@medialane/sdk";
import { MissingFilesError, StillConfirmingError } from "@/lib/launchpad/engine";
import { putFileToSignedUrl } from "@/lib/launchpad/upload";
import type { TaskPhase } from "@/lib/launchpad/task-progress";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface RunDeps {
  signal: AbortSignal;
  wait(ms: number): Promise<void>;
  putFile(url: string, file: File): Promise<string>;
  sponsored(base: string): Promise<string>;
}

export interface RunContext<E> {
  deps: RunDeps;
  emit(event: E): void;
}

function sponsoredBy(signer: StarknetVenueSigner, client: LaunchpadRunsClient) {
  return async (base: string) => {
    const result = await executeSponsored(
      { proxyUrl: base, fetchImpl: client.authorizedFetch },
      signer as unknown as TypedDataSigner,
      [],
    );
    if (result.status !== "sponsored") throw new Error(result.reason);
    return result.transactionHash;
  };
}

interface Options<E> {
  client: LaunchpadRunsClient;
  signer: StarknetVenueSigner | null;
  address: string | null | undefined;
  describe(event: E): string;
  onRun(run: LaunchpadRun): void;
  onNeedsFiles(files: string[]): void;
  onSuccess?(run: LaunchpadRun): void;
}

export function useRunExecution<E>({ client, signer, address, describe, onRun, onNeedsFiles, onSuccess }: Options<E>) {
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const fail = useCallback((message: string, as: TaskPhase = "error") => {
    setError(message);
    setPhase(as);
  }, []);

  const save = useCallback(
    async (action: () => Promise<LaunchpadRun>) => {
      setPhase("running");
      setDetail("Saving your run");
      setError(null);
      try {
        onRun(await action());
        setPhase("idle");
      } catch (e) {
        fail(e instanceof Error ? e.message : "Could not save this run.");
      } finally {
        setDetail(null);
      }
    },
    [onRun, fail],
  );

  const execute = useCallback(
    async (target: LaunchpadRun, run: (context: RunContext<E>) => Promise<LaunchpadRun>) => {
      if (!signer || !address) return;
      controller.current?.abort();
      const { signal } = (controller.current = new AbortController());

      onRun(target);
      setError(null);
      setPhase("running");
      try {
        const finished = await run({
          emit: (event) => !signal.aborted && setDetail(describe(event)),
          deps: { signal, wait: sleep, putFile: putFileToSignedUrl, sponsored: sponsoredBy(signer, client) },
        });
        onRun(finished);
        setPhase("success");
        onSuccess?.(finished);
      } catch (e) {
        if (signal.aborted) return;
        if (e instanceof MissingFilesError) {
          onNeedsFiles(e.files);
          setPhase("idle");
          return;
        }
        if (e instanceof StillConfirmingError) fail(e.message, "waiting");
        else fail(e instanceof Error ? e.message : "The run stopped. Continue to pick up where it left off.");
        const latest = await client.get(target.id).catch(() => target);
        if (!signal.aborted) onRun(latest);
      } finally {
        if (!signal.aborted) setDetail(null);
      }
    },
    [signer, address, client, describe, onRun, onNeedsFiles, onSuccess, fail],
  );

  return {
    phase,
    detail,
    error,
    busy: phase === "running",
    execute,
    save,
    fail,
    clearError: useCallback(() => setError(null), []),
    close: useCallback(() => setPhase("idle"), []),
  };
}
