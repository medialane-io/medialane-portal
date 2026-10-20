"use client";

import { useRouter, usePathname } from "next/navigation";
import type { MedialaneApp } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { getMedialaneClient } from "@/lib/medialane-client";

export function useAppAdapter(): MedialaneApp {
  const { address, signer } = useWalletNativeSession();
  const router = useRouter();
  const pathname = usePathname();
  return {
    getClient: getMedialaneClient,
    walletAddress: address ?? null,
    onRequireWallet: () => router.push(`/connect?redirect_url=${encodeURIComponent(pathname)}`),
    connectLabel: "Connect with email",
    getSigner: () => {
      if (!signer) throw new Error("Wallet not ready. Sign in and try again.");
      return signer;
    },
  };
}
