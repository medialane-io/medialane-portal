"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

/**
 * The portal's single wallet hook. Connect-only: it exposes the connected
 * address, connection state, the available injected connectors, and
 * connect/disconnect. No signing, no session — the address is identity.
 */
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
