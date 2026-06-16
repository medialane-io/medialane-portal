"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "@starknet-react/core";

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
 * Connect-only portal session — like the dapp, no signature. Connecting a wallet
 * IS the login: this hook establishes a short-lived session cookie from the
 * connected address (POST /api/auth/session) and reads it back (GET). There is
 * no challenge/sign/verify step. The session cookie lets the portal's dashboard
 * and backend proxy resolve the connected address server-side.
 */
export function useSiwsAuth() {
  const { address } = useAccount();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Collapses concurrent establish attempts onto a single in-flight promise.
  const establishPromiseRef = useRef<Promise<PortalSession | null> | null>(null);

  const refresh = useCallback(async (): Promise<PortalSession | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        setSession(null);
        return null;
      }
      const data = await res.json();
      // A cookie for a different wallet than the one now connected is not "our"
      // session — treat it as signed-out so a fresh session is established.
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

  const signIn = useCallback(async (): Promise<PortalSession | null> => {
    if (establishPromiseRef.current) return establishPromiseRef.current;
    if (!address) {
      const msg = "Connect your wallet first";
      setError(msg);
      throw new Error(msg);
    }
    const run = (async () => {
      setIsSigningIn(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Sign-in failed");
        }
        return await refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign-in failed";
        setError(msg);
        throw err instanceof Error ? err : new Error(msg);
      } finally {
        setIsSigningIn(false);
        establishPromiseRef.current = null;
      }
    })();
    establishPromiseRef.current = run;
    return run;
  }, [address, refresh]);

  const ensureSession = useCallback(async (): Promise<PortalSession | null> => {
    const existing = await refresh();
    if (existing) return existing;
    return signIn();
  }, [refresh, signIn]);

  // Connect = logged in: as soon as a wallet is connected and there is no
  // matching session yet, establish one automatically (no prompt, no signature).
  useEffect(() => {
    if (!address) {
      setSession(null);
      return;
    }
    ensureSession().catch(() => {
      // Surfaced via `error`; the user stays connected and can retry.
    });
  }, [address, ensureSession]);

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
