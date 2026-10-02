function formatEstimate(amount: number): string {
  if (amount >= 100) return Math.round(amount).toLocaleString("en-US");
  if (amount >= 1) return String(Number(amount.toFixed(2)));
  const places = Math.min(12, 2 - Math.floor(Math.log10(amount)));
  return String(Number(amount.toFixed(places)));
}

export function tokenAmountEstimate(dollars: number, symbol: string, price: number | undefined): string | null {
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  const unitPrice = symbol === "USDC" ? 1 : price;
  if (unitPrice === undefined || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  return formatEstimate(dollars / unitPrice);
}

export function tokenAtomicEstimate(dollars: number, symbol: string, decimals: number, price: number | undefined): bigint | null {
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  const unitPrice = symbol === "USDC" ? 1 : price;
  if (unitPrice === undefined || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  const usdMicros = BigInt(Math.round(dollars * 1_000_000));
  const priceMicros = BigInt(Math.round(unitPrice * 1_000_000));
  if (priceMicros <= 0n) return null;
  const numerator = usdMicros * 10n ** BigInt(decimals);
  return (numerator + priceMicros - 1n) / priceMicros;
}
