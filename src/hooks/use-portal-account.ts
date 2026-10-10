"use client";

import useSWR from "swr";
import { MedialaneApiError, type ApiPortalMe, type ApiPortalKey, type ApiPortalSpend, type ApiCreditPayment } from "@medialane/sdk";
import { getMedialaneClient } from "@/lib/medialane-client";
import { useWalletNativeSession } from "./use-wallet-native-session";
import { useSession } from "./use-session";

async function orNull<T>(request: Promise<{ data: T }>): Promise<T | null> {
  try {
    return (await request).data;
  } catch (err) {
    if (err instanceof MedialaneApiError && [401, 403, 404].includes(err.status)) return null;
    throw err;
  }
}

const api = () => getMedialaneClient().api;

const quiet = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

export function usePortalSession() {
  const { hasWallet } = useWalletNativeSession();
  const { session } = useSession();

  const { data, error, isLoading, mutate } = useSWR(
    session ? "portal:me" : null,
    () => orNull<ApiPortalMe>(api().getMe()),
    quiet,
  );

  return { signedIn: data != null, account: data, ready: !isLoading, hasWallet, error, refresh: mutate };
}

export function usePortalKeys(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:keys" : null,
    () => orNull<ApiPortalKey[]>(api().getApiKeys()),
    quiet,
  );
}

export function usePortalSpend(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:spend" : null,
    () => orNull<ApiPortalSpend>(api().getSpend()),
    quiet,
  );
}

export function usePortalCredits(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:credits" : null,
    () => orNull<ApiCreditPayment[]>(api().getCreditHistory()),
    quiet,
  );
}
