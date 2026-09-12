"use client";

import { useCallback, useState } from "react";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import { useWalletNativeSession } from "./use-wallet-native-session";
import { lockVenueSigner } from "@/lib/wallet/venue-signer";
import { assertTransactionSucceeded } from "@/lib/wallet/intent-tx";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { loadAccountAddress } from "@/lib/wallet/account-wallet";

export type WalletWriteStatus = "idle" | "processing" | "confirming" | "success" | "error";

export function useWalletWriteAction(
  verify: (txHash: string) => Promise<void> = assertTransactionSucceeded,
) {
  const { hasWallet, signer } = useWalletNativeSession();
  const [status, setStatus] = useState<WalletWriteStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsDeviceApproval, setNeedsDeviceApproval] = useState(false);

  const run = useCallback(
    async (execute: (signer: StarknetVenueSigner) => Promise<{ txHash: string } | void>) => {
      if (!hasWallet || !signer) {
        if (loadAccountAddress()) {
          setNeedsDeviceApproval(true);
          setError("This device needs to be approved before it can sign for your account.");
          setStatus("error");
        }
        return;
      }
      setStatus("processing");
      setError(null);
      setNeedsDeviceApproval(false);
      try {
        const result = await execute(signer);
        if (result?.txHash) setTxHash(result.txHash);
        setStatus("confirming");
        
        if (result?.txHash) await verify(result.txHash);
        setStatus("success");
      } catch (err) {
        setError(friendlyErrorMessage(err));
        setStatus("error");
      } finally {
        lockVenueSigner(signer.address);
      }
    },
    [hasWallet, signer, verify],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
    setNeedsDeviceApproval(false);
  }, []);

  return {
    status,
    txHash,
    error,
    run,
    reset,
    walletNotReady: !hasWallet,
    needsDeviceApproval,
  };
}
