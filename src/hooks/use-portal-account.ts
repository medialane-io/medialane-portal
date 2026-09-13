"use client";

import useSWR from "swr";
import type { ApiPortalMe, ApiPortalKey, ApiPortalSpend, ApiCreditPayment } from "@medialane/sdk";

async function read<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} failed`);
  const body = (await res.json()) as { data: T };
  return body.data;
}

const quiet = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

export function usePortalSession() {
  const { data, error, isLoading, mutate } = useSWR(
    "portal:me",
    () => read<ApiPortalMe>("/api/proxy/v1/portal/me"),
    quiet,
  );

  return { signedIn: data != null, account: data, ready: !isLoading, error, refresh: mutate };
}

export function usePortalKeys(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:keys" : null,
    () => read<ApiPortalKey[]>("/api/proxy/v1/portal/keys"),
    quiet,
  );
}

export function usePortalSpend(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:spend" : null,
    () => read<ApiPortalSpend>("/api/proxy/v1/portal/credits/spend"),
    quiet,
  );
}

export function usePortalCredits(signedIn: boolean) {
  return useSWR(
    signedIn ? "portal:credits" : null,
    () => read<ApiCreditPayment[]>("/api/proxy/v1/portal/credits/history"),
    quiet,
  );
}
