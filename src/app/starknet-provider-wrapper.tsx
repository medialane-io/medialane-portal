'use client';

import { StarknetConfig, InjectedConnector, jsonRpcProvider } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const nodeUrl = process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/tOTwt1ug3YNOsaPjinDvS';

  const connectors = useMemo(() => {
    const base = [
      new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
      new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    ];

    // Load Cartridge connector only on client — it uses WASM
    if (typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ControllerConnector } = require('@cartridge/connector');
        base.push(new ControllerConnector());
      } catch {
        // Cartridge not available — continue without it
      }
    }

    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={jsonRpcProvider({ rpc: () => ({ nodeUrl }) })}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
