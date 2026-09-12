"use client";

import useSWR from "swr";
import { starknetProvider } from "@/lib/starknet";
import { getListableTokens, parseAmount } from "@medialane/sdk";

async function fetchErc20Balance(tokenAddress: string, holderAddress: string): Promise<bigint> {
  const result = await starknetProvider.callContract(
    {
      contractAddress: tokenAddress,
      entrypoint: "balanceOf",
      calldata: [holderAddress],
    },
    "latest"
  );

  const low = BigInt(result[0]);
  const high = BigInt(result[1]);
  return low + (high << 128n);
}

export function useErc20Balance(tokenAddress: string | null, holderAddress: string | null) {
  const { data, error, isLoading } = useSWR(
    tokenAddress && holderAddress ? ["erc20-balance", tokenAddress, holderAddress] : null,
    ([, addr, holder]) => fetchErc20Balance(addr, holder),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {

      },
    }
  );
  return { rawBalance: data ?? null, isLoading, error };
}

export function useTokenBalance(symbol: string | null, holderAddress: string | null) {
  const token = symbol ? getListableTokens().find((t) => t.symbol === symbol) ?? null : null;
  const { rawBalance, isLoading, error } = useErc20Balance(token?.address ?? null, holderAddress);
  return { rawBalance, isLoading, error, decimals: token?.decimals ?? 18 };
}

export function hasSufficientBalance(
  rawBalance: bigint | null,
  requiredHuman: string,
  decimals: number
): boolean | null {
  if (rawBalance === null) return null;
  const n = parseFloat(requiredHuman);
  if (!requiredHuman || isNaN(n) || n <= 0) return null;
  const required = BigInt(parseAmount(requiredHuman, decimals));
  return rawBalance >= required;
}
