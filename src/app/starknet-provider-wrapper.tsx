'use client';

import { StarknetConfig, InjectedConnector, useInjectedConnectors } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { createFailoverFetch, PUBLIC_RPC_FALLBACKS } from '@/src/lib/rpc-failover';

/**
 * Injected-only Starknet connection for the portal.
 *
 * Connect-only: this provider establishes which wallet is connected and its
 * address. There is no signing/session layer on top — the connected address is
 * the portal's only notion of identity, passed straight to the API routes.
 *
 * `useInjectedConnectors` discovers installed extensions via the wallet
 * standard, so Ready (formerly Argent) is found regardless of whether it
 * advertises itself as `argentX` or `ready`. Braavos likewise.
 */
export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const nodeUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    'https://starknet-mainnet.public.blastapi.io/rpc/v0_8';

  const { connectors } = useInjectedConnectors({
    recommended: [
      new InjectedConnector({ options: { id: 'argentX', name: 'Ready (formerly Argent)' } }),
      new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    ],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  });

  // Fail over to public endpoints when the primary RPC intermittently 503s /
  // returns -32001, so the post-connect chain-match check doesn't hang.
  const provider = useMemo(() => {
    const failoverFetch = createFailoverFetch([nodeUrl, ...PUBLIC_RPC_FALLBACKS]);
    return () => new RpcProvider({ nodeUrl, baseFetch: failoverFetch });
  }, [nodeUrl]);

  return (
    <StarknetConfig chains={[mainnet]} provider={provider} connectors={connectors} autoConnect>
      {children}
    </StarknetConfig>
  );
}
