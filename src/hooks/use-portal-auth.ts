"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import type { TypedData } from "starknet";
import { requestPortalSession } from "@/src/lib/portal-auth-client";

export type PortalSessionView = {
  accountId: string;
  address: string;
  chain: string;
  is_admin: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * The portal's sign-in hook. Reads the current session (HttpOnly cookie, via
 * /api/auth/session), and drives sign-in (challenge → wallet signature → verify
 * → AccountID session) and sign-out. The connected wallet is the signer.
 */
export function usePortalAuth() {
  const { account, address } = useAccount();
  const { data, isLoading, mutate } = useSWR<{ session: PortalSessionView | null }>(
    "/api/auth/session",
    fetcher,
    { revalidateOnFocus: false },
  );
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    if (!account || !address) {
      setError("Connect a wallet first");
      return;
    }
    setSigningIn(true);
    setError(null);
    try {
      await requestPortalSession(address, {
        signMessage: (typedData: TypedData) => account.signMessage(typedData),
      });
      await mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    await mutate({ session: null }, { revalidate: false });
  }

  return {
    session: data?.session ?? null,
    isLoading,
    signingIn,
    error,
    signIn,
    signOut,
  };
}
