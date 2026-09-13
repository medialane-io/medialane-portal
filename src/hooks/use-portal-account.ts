"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { getMedialaneClient } from "@/lib/medialane-client";
import { loadAccountSession, onAccountSessionChange } from "@/lib/account-session";

export function usePortalToken() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setToken(loadAccountSession());
    read();
    setReady(true);
    return onAccountSessionChange(read);
  }, []);

  const authorize = useCallback(async () => loadAccountSession(), []);

  return { token, authorize, reauthorize: authorize, isSigningIn: false, error: null, ready };
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
