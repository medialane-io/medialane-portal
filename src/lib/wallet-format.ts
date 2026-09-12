import { formatAmount } from "@medialane/sdk";
import { ipfsToHttp } from "@/lib/utils";
import { EXPLORER_URL } from "@/lib/constants";
import type { UsdPrices } from "@/hooks/use-usd-prices";

export const gateway = (u: string | null): string | null => (u ? ipfsToHttp(u) : null);

export const short = (a?: string | null): string =>
  a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a ?? "";

export const explorerTokenUrl = (address: string): string => `${EXPLORER_URL}/token/${address}`;
export const explorerTxUrl = (txHash: string): string => `${EXPLORER_URL}/tx/${txHash}`;

export const rawToNumber = (raw: bigint | null, decimals: number): number => {
  if (raw == null) return 0;
  return Number(raw) / 10 ** decimals;
};

export const fmt = (raw: bigint | null, decimals = 18, dp = 4): string => {
  if (raw == null) return "—";
  const [whole, frac = ""] = formatAmount(raw.toString(), decimals).split(".");
  const t = frac.slice(0, dp).replace(/0+$/, "");
  return t ? `${whole}.${t}` : whole;
};

export const fmtUsd = (n: number): string =>
  n > 0 && n < 0.01 ? "<$0.01" : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const usdValueFor = (
  amountFormatted: string | null | undefined,
  currency: string | null | undefined,
  usdPrices: UsdPrices | null
): string | null => {
  if (!amountFormatted || !currency || !usdPrices) return null;
  const rate = usdPrices[currency.toUpperCase() as keyof UsdPrices];
  if (rate == null) return null;
  const amount = parseFloat(amountFormatted);
  if (isNaN(amount)) return null;
  return fmtUsd(amount * rate);
};

export const when = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
