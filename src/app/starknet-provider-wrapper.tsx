'use client';

import { StarknetConfig, voyager } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { QueryClient } from '@tanstack/react-query';
import { createFailoverFetch } from '@medialane/sdk';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { RPC_PROXY_PATH, RPC_FALLBACK_URL } from '@/src/lib/constants';
import { walletConnectors } from '@/src/lib/wallet-connectors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 10_000,
    },
  },
});

export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const providerFactory = useMemo(() => {
    const failoverFetch = createFailoverFetch([RPC_PROXY_PATH, RPC_FALLBACK_URL]);
    return () => new RpcProvider({ nodeUrl: RPC_PROXY_PATH, baseFetch: failoverFetch });
  }, []);

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={providerFactory}
      connectors={walletConnectors}
      explorer={voyager}
      queryClient={queryClient}
      defaultChainId={mainnet.id}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
