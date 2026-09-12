"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { getMedialaneClient } from "@/lib/medialane-client";

export function usePortalToken() {
  const { address } = useWalletNativeSession();
  const { token, signIn, getValidToken, isSigningIn, error } = useSiwsToken();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!address) return;
    getValidToken();
    setReady(true);
  }, [address, getValidToken]);

  const authorize = useCallback(async () => {
    const existing = getValidToken();
    if (existing) return existing;
    return signIn();
  }, [getValidToken, signIn]);

  return { token, address, authorize, isSigningIn, error, ready };
}

const api = () => getMedialaneClient().api;

export function usePortalAccount(token: string | null) {
  return useSWR(token ? ["portal:me", token] : null, async ([, t]) => (await api().getMe(t)).data, {
    revalidateOnFocus: false,
  });
}

export function usePortalKeys(token: string | null) {
  return useSWR(token ? ["portal:keys", token] : null, async ([, t]) => (await api().getApiKeys(t)).data, {
    revalidateOnFocus: false,
  });
}

export function usePortalSpend(token: string | null) {
  return useSWR(token ? ["portal:spend", token] : null, async ([, t]) => (await api().getSpend(t)).data, {
    revalidateOnFocus: false,
  });
}

export function usePortalCredits(token: string | null) {
  return useSWR(token ? ["portal:credits", token] : null, async ([, t]) => (await api().getCreditHistory(t)).data, {
    revalidateOnFocus: false,
  });
}
