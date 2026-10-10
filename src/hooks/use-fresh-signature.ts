"use client";

import { useCallback } from "react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { lockVenueSigner } from "@/lib/wallet/venue-signer";
import { requestSiwsToken } from "@/lib/siws-client";

export function useFreshSignature(): () => Promise<string | null> {
  const { address: walletAddress, signer } = useWalletNativeSession();
  return useCallback(async () => {
    if (!walletAddress || !signer) return null;
    try {
      return await requestSiwsToken({ walletAddress, signer: { signMessage: (typedData) => signer.signTypedData(typedData) } });
    } finally {
      lockVenueSigner(walletAddress);
    }
  }, [walletAddress, signer]);
}
