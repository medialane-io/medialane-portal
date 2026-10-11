const AMOUNT = /^\d{1,12}(\.\d{1,18})?$/;

export function atomicAmount(amount: string, decimals: number): bigint | null {
  if (!AMOUNT.test(amount)) return null;
  const [whole = "0", fraction = ""] = amount.split(".");
  if (fraction.length > decimals) return null;
  const atomic = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  return atomic > 0n ? atomic : null;
}

export function creditsEstimate(amount: string, symbol: string, price: number | undefined): number | null {
  if (!AMOUNT.test(amount)) return null;
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unitPrice = symbol === "USDC" ? 1 : price;
  if (unitPrice === undefined || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  return Math.floor(value * unitPrice * 100);
}
