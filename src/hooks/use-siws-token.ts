"use client";

import { useCallback, useState } from "react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { lockVenueSigner } from "@/lib/wallet/venue-signer";
import {
  getStoredSiwsToken,
  requestSiwsToken,
  type SiwsSigner,
} from "@/lib/siws-client";
import { friendlyErrorMessage } from "@/lib/friendly-error";

export class WalletNotDeployedError extends Error {
  constructor() {
    super("Wallet is not deployed yet.");
    this.name = "WalletNotDeployedError";
  }
}

export function useSiwsToken() {
  const { address: walletAddress, signer, isDeployed } = useWalletNativeSession();
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!walletAddress || !signer) return null;

    if (isDeployed === false) throw new WalletNotDeployedError();

    const siwsSigner: SiwsSigner = {
      signMessage: (typedData) => signer.signTypedData(typedData),
    };

    setIsSigningIn(true);
    setError(null);
    try {
      const newToken = await requestSiwsToken({ walletAddress, signer: siwsSigner });
      setToken(newToken);
      return newToken;
    } catch (err) {
      const message = friendlyErrorMessage(err, "Account sign-in failed");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      lockVenueSigner(walletAddress);
      setIsSigningIn(false);
    }
  }, [walletAddress, signer, isDeployed]);

  const getValidToken = useCallback((): string | null => {
    if (!walletAddress) return null;
    const existing = getStoredSiwsToken(walletAddress);
    if (existing) setToken(existing);
    return existing;
  }, [walletAddress]);

  return { token, signIn, getValidToken, isSigningIn, error };
}
