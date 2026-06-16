'use client';

import { StarknetConfig } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import { RpcProvider } from 'starknet';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { idResolvedReady, idResolvedBraavos } from '@/src/lib/starknet-connectors';
import { createFailoverFetch, PUBLIC_RPC_FALLBACKS } from '@/src/lib/rpc-failover';

export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const nodeUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/tOTwt1ug3YNOsaPjinDvS';

  // Ready (formerly Argent) advertises wallet.id "ready", not "argentX". The
  // id-resolving connectors (ported from the working dapp) find the extension
  // across that rebrand so connect doesn't hang. Mirrors the dapp's setup.
  const connectors = useMemo(
    () => [idResolvedReady(), idResolvedBraavos()],
    [],
  );

  // Fail over to public endpoints when the primary RPC (Alchemy) intermittently
  // 503s / returns -32001 — otherwise the post-connect chain-match check hangs
  // and the wallet prompt spins forever.
  const provider = useMemo(() => {
    const failoverFetch = createFailoverFetch([nodeUrl, ...PUBLIC_RPC_FALLBACKS]);
    return () => new RpcProvider({ nodeUrl, baseFetch: failoverFetch });
  }, [nodeUrl]);

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
