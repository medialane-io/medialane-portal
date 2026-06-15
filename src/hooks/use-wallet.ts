"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

/**
 * Thin wallet hook for the portal — mirrors the dapp's useWallet() surface but
 * over starknet-react directly. The portal is injected-only (Ready/Braavos), so
 * there is no multi-rail active-slot referee to maintain.
 */
export function useWallet() {
  const { address, status, account } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address: address ?? null,
    account,
    isConnected: status === "connected" && Boolean(address),
    isConnecting: status === "connecting",
    connectors,
    connect,
    disconnect,
  };
}
