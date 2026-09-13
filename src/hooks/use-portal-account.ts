"use client";

import useSWR from "swr";
import type { ApiPortalMe, ApiPortalKey, ApiPortalSpend, ApiCreditPayment } from "@medialane/sdk";
import { useWalletNativeSession } from "./use-wallet-native-session";
import { useSiwsToken } from "./use-siws-token";

async function read<T>(url: string, token: string | null): Promise<T | null> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} failed`);
  const body = (await res.json()) as { data: T };
  return body.data;
}

const quiet = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

export function usePortalSession() {
  const { hasWallet } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();

  const { data, error, isLoading, mutate } = useSWR(
    "portal:me",
    async () => {
      const token = hasWallet ? (getValidToken() ?? (await signIn())) : null;
      return read<ApiPortalMe>("/api/proxy/v1/portal/me", token);
    },
    quiet,
  );

  return { signedIn: data != null, account: data, ready: !isLoading, error, refresh: mutate };
}

export function usePortalKeys(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:keys" : null,
    () => read<ApiPortalKey[]>("/api/proxy/v1/portal/keys", getValidToken()),
    quiet,
  );
}

export function usePortalSpend(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:spend" : null,
    () => read<ApiPortalSpend>("/api/proxy/v1/portal/credits/spend", getValidToken()),
    quiet,
  );
}

export function usePortalCredits(signedIn: boolean) {
  const { getValidToken } = useSiwsToken();
  return useSWR(
    signedIn ? "portal:credits" : null,
    () => read<ApiCreditPayment[]>("/api/proxy/v1/portal/credits/history", getValidToken()),
    quiet,
  );
}
