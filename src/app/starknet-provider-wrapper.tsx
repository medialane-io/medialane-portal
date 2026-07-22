'use client';

import { StarknetConfig, InjectedConnector, useInjectedConnectors } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { createFailoverFetch } from '@medialane/sdk';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { RPC_PROXY_PATH, RPC_FALLBACK_URL } from '@/src/lib/constants';

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
 *
 * 🔑 The browser talks to the same-origin `/api/rpc` proxy (`src/app/api/rpc/route.ts`),
 * never a keyed URL directly — a NEXT_PUBLIC_ keyed RPC URL is inlined into the
 * client bundle (this is exactly how the portal leaked its Alchemy key). The
 * proxy holds the keyed MAIN URL server-only and rotates to the keyless public
 * FALLBACK on a transient error.
 */
export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [
      new InjectedConnector({ options: { id: 'argentX', name: 'Ready (formerly Argent)' } }),
      new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    ],
    includeRecommended: 'onlyIfNoConnectors',
    order: 'alphabetical',
  });

  // Primary is the same-origin proxy; the keyless public fallback is safe to
  // hit directly if the proxy itself is unreachable.
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
