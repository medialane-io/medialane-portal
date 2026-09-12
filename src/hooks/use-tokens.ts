"use client";

import { useState } from "react";
import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client";
import type { ApiToken } from "@medialane/sdk";
import { queryKeys } from "@/lib/query-keys";

const EMPTY_TOKENS: ApiToken[] = [];

const INDEXING_POLL_MS = 10_000;
const INDEXING_WINDOW_MS = 60_000;

function isNotIndexedYet(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && (error as { status?: unknown }).status === 404,
  );
}

export function useToken(contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();
  const [startedAt] = useState(() => Date.now());

  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? queryKeys.token(contract, tokenId) : null,
    () => client.api.getToken(contract!, tokenId!),
    {
      revalidateOnFocus: false,
      
      shouldRetryOnError: false,
      refreshInterval: (latest) =>
        latest?.data || Date.now() - startedAt > INDEXING_WINDOW_MS ? 0 : INDEXING_POLL_MS,
    }
  );

  const token = data?.data ?? null;
  const withinWindow = Date.now() - startedAt <= INDEXING_WINDOW_MS;

  return {
    token,
    isLoading,
    
    isIndexing: !token && isNotIndexedYet(error) && withinWindow,
    error: isNotIndexedYet(error) ? undefined : error,
    mutate,
  };
}

export function useTokensByOwner(address: string | null, page = 1, limit = 20) {
  const client = useMedialaneClient();

  const { data, error, isLoading, mutate } = useSWR(
    address ? queryKeys.tokensOwned(address, page, limit) : null,
    () => client.api.getTokensByOwner(address!, page, limit),
    { revalidateOnFocus: false, refreshInterval: 60_000, revalidateOnMount: true }
  );

  return {
    tokens: data?.data ?? EMPTY_TOKENS,
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useTokenHistory(contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading } = useSWR(
    contract && tokenId ? queryKeys.tokenHistory(contract, tokenId) : null,
    () => client.api.getTokenHistory(contract!, tokenId!),
    { revalidateOnFocus: false }
  );

  return { history: data?.data ?? [], isLoading, error };
}
