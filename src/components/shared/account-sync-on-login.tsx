"use client";

import { useEffect } from "react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { getMedialaneClient } from "@/lib/medialane-client";

const SESSION_KEY_PREFIX = "ml_io_synced_";

export function AccountSyncOnLogin() {
  const { hasWallet, address: walletAddress } = useWalletNativeSession();
  const { getValidToken } = useSiwsToken();

  useEffect(() => {
    if (!hasWallet || !walletAddress) return;

    const walletType = "MEDIAWALLET" as const;
    const appSource = "MEDIALANE_IO" as const;
    const key = `${SESSION_KEY_PREFIX}${walletAddress}:${walletType}`;
    if (sessionStorage.getItem(key)) return;

    const token = getValidToken();
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const pendingEmail = sessionStorage.getItem("ml_pending_email");
        if (pendingEmail) sessionStorage.removeItem("ml_pending_email");

        await getMedialaneClient().api.upsertMyWallet(token, {
          walletType,
          appSource,
          chain: "STARKNET",
          ...(pendingEmail ? { email: pendingEmail } : {}),
        });
        if (!cancelled) sessionStorage.setItem(key, "1");
      } catch (error) {

        if (!cancelled) {
          console.error("[ml-register] failed", {
            appSource,
            walletType,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasWallet, walletAddress, getValidToken]);

  return null;
}
