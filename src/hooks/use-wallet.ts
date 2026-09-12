"use client";

import { useWalletNativeSession } from "./use-wallet-native-session";

export function useWallet() {
  const { address, hasWallet } = useWalletNativeSession();
  return {
    address,
    isConnected: hasWallet,
  };
}
