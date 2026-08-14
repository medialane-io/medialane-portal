'use client';

import { StarknetConfig, InjectedConnector, useInjectedConnectors } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { createFailoverFetch } from '@medialane/sdk';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { RPC_PROXY_PATH, RPC_FALLBACK_URL } from '@/src/lib/constants';

export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [
      new InjectedConnector({ options: { id: 'argentX', name: 'Ready (formerly Argent)' } }),
      new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    ],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  });

  const provider = useMemo(() => {
    const failoverFetch = createFailoverFetch([RPC_PROXY_PATH, RPC_FALLBACK_URL]);
    return () => new RpcProvider({ nodeUrl: RPC_PROXY_PATH, baseFetch: failoverFetch });
  }, []);

  return (
    <StarknetConfig chains={[mainnet]} provider={provider} connectors={connectors} autoConnect>
      {children}
    </StarknetConfig>
  );
}
