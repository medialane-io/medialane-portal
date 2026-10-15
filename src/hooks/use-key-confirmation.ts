"use client";

import { useCallback } from "react";
import type { ApiKeyAction, ApiKeyConfirmation } from "@medialane/sdk/starknet";
import { useSession } from "@/hooks/use-session";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { signKeyConfirmation } from "@/lib/wallet/key-confirmation";
import { lockVenueSigner } from "@/lib/wallet/venue-signer";

/** Asks the account's wallet to approve one API key change. Null when it cannot. */
export function useKeyConfirmation(): (change: { action: ApiKeyAction; key: string }) => Promise<ApiKeyConfirmation | null> {
  const { session } = useSession();
  const { signer } = useWalletNativeSession();
  return useCallback(
    async (change) => {
      if (!session || !signer) return null;
      try {
        return await signKeyConfirmation(signer, session.publicId, change);
      } finally {
        lockVenueSigner(signer.address);
      }
    },
    [session, signer],
  );
}
