"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export function useWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address: address ?? null,
    isConnected: isConnected ?? false,
    isConnecting: status === "connecting" || status === "reconnecting",
    connectors,
    connect,
    disconnect,
  };
}
