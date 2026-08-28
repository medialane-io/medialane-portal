'use client';

import { StarknetConfig, voyager } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { RPC_PROXY_PATH } from '@/src/lib/constants';
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
    // Only the metered proxy. A public RPC used to sit behind it as a
    // fallback, but failover fires on exactly the responses the meter returns
    // when it refuses — 429 and 402 — so hitting a limit silently moved every
    // chain read onto a free endpoint instead of stopping it.
    return () => new RpcProvider({ nodeUrl: RPC_PROXY_PATH });
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
