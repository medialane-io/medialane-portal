import { useEffect, useState } from "react";
import useSWR from "swr";
import { quoteRun, type RunQuote } from "@/src/lib/issue";
import { CREDITS_PER_USDC } from "@/src/lib/constants";

export function usdFromCredits(credits: number): number {
  return CREDITS_PER_USDC > 0 ? credits / CREDITS_PER_USDC : 0;
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return "under $0.01";
  return `$${amount.toFixed(2)}`;
}

const QUOTE_SETTLE_MS = 400;

export function useRunQuote(service: string, recipients: number) {
  const settled = useSettled(recipients, QUOTE_SETTLE_MS);
  const { data } = useSWR<RunQuote>(
    settled > 0 ? ["launchpad-quote", service, settled] : null,
    () => quoteRun(service, settled),
    { revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: true },
  );
  return data;
}

function useSettled<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}
