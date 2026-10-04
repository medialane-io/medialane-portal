"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client";
import type { ApiToken } from "@medialane/sdk";
import { queryKeys } from "@/lib/query-keys";

const EMPTY_TOKENS: ApiToken[] = [];

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
