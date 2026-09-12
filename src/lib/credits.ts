import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export interface CreditTerms {
  treasury: string;
  asset: string;
  creditsPerUsdc: number;
  decimals: number;
}

const USDC_DECIMALS = 6;

export async function creditTerms(): Promise<CreditTerms | null> {
  try {
    const res = await fetch(`${MEDIALANE_BACKEND_URL}/v1/pricing`);
    if (!res.ok) return null;
    const body = (await res.json()) as {
      payTo?: string;
      asset?: string;
      creditsPerUsdc?: number;
    };
    if (!body.payTo || !body.asset) return null;
    return {
      treasury: body.payTo,
      asset: body.asset,
      creditsPerUsdc: body.creditsPerUsdc ?? 100,
      decimals: USDC_DECIMALS,
    };
  } catch {
    return null;
  }
}

export function atomicAmount(usdc: string, decimals: number): bigint | null {
  const trimmed = usdc.trim();
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed)) return null;
  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;
  const padded = fraction.padEnd(decimals, "0");
  const value = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
  return value > 0n ? value : null;
}

export function creditsFor(usdc: string, creditsPerUsdc: number): number {
  const amount = Number.parseFloat(usdc);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.floor(amount * creditsPerUsdc);
}

export function transferCall(terms: CreditTerms, amount: bigint) {
  return {
    contractAddress: terms.asset,
    entrypoint: "transfer",
    calldata: [terms.treasury, (amount & ((1n << 128n) - 1n)).toString(), (amount >> 128n).toString()],
  };
}
