"use client";

import useSWR from "swr";
import { MedialaneApiError, type ApiPortalMe, type ApiPortalKey, type ApiPortalSpend, type ApiCreditPayment } from "@medialane/sdk";
import { getMedialaneClient } from "@/lib/medialane-client";
import { useWalletNativeSession } from "./use-wallet-native-session";
import { useSiwsToken } from "./use-siws-token";

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
  const { getValidToken, signIn } = useSiwsToken();

  const { data, error, isLoading, mutate } = useSWR(
    "portal:me",
    async () => {
      if (!hasWallet) return null;
      const token = getValidToken() ?? (await signIn());
      return orNull<ApiPortalMe>(api().getMe(token ?? undefined));
    },
    quiet,
  );

  return { signedIn: data != null, account: data, ready: !isLoading, hasWallet, error, refresh: mutate };
}

export function usePortalKeys(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:keys" : null,
    () => orNull<ApiPortalKey[]>(api().getApiKeys(getValidToken() ?? undefined)),
    quiet,
  );
}

export function usePortalSpend(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:spend" : null,
    () => orNull<ApiPortalSpend>(api().getSpend(getValidToken() ?? undefined)),
    quiet,
  );
}

export function usePortalCredits(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:credits" : null,
    () => orNull<ApiCreditPayment[]>(api().getCreditHistory(getValidToken() ?? undefined)),
    quiet,
  );
}
