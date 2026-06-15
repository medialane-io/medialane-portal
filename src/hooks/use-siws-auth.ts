"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { requestPortalSession } from "@/src/lib/siws-client";

export interface PortalSession {
  address: string;
  is_admin: boolean;
  mdln_tier: number;
}

function sameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  try {
    return BigInt(a) === BigInt(b);
  } catch {
    return a.toLowerCase() === b.toLowerCase();
  }
}

/**
 * Lazy sign-on-demand auth. Connecting a wallet does NOT sign. A session is
 * minted only when ensureSession()/signIn() is called (entering the dashboard
 * or admin, provisioning a key). The session lives in an HttpOnly cookie; this
 * hook reads its state via /api/auth/session.
 */
export function useSiwsAuth() {
  const { address, account } = useAccount();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<PortalSession | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        setSession(null);
        return null;
      }
      const data = await res.json();
      // A cookie for a different wallet than the one now connected is not "our"
      // session — treat it as signed-out so the UI prompts a fresh sign-in.
      if (address && !sameAddress(data.address, address)) {
        setSession(null);
        return null;
      }
      const s: PortalSession = {
        address: data.address,
        is_admin: data.is_admin === true,
        mdln_tier: data.mdln_tier ?? 0,
      };
      setSession(s);
      return s;
    } catch {
      setSession(null);
      return null;
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (): Promise<PortalSession | null> => {
    if (!address || !account) {
      const msg = "Connect your wallet first";
      setError(msg);
      throw new Error(msg);
    }
    setIsSigningIn(true);
    setError(null);
    try {
      await requestPortalSession(address, account);
      return await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setIsSigningIn(false);
    }
  }, [address, account, refresh]);

  const ensureSession = useCallback(async (): Promise<PortalSession | null> => {
    const existing = await refresh();
    if (existing) return existing;
    return signIn();
  }, [refresh, signIn]);

  const signOut = useCallback(async (): Promise<void> => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
  }, []);

  return {
    session,
    isSignedIn: session !== null,
    isSigningIn,
    error,
    signIn,
    ensureSession,
    signOut,
    refresh,
  };
}
