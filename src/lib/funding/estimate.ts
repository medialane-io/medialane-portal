function formatEstimate(amount: number): string {
  if (amount >= 100) return Math.round(amount).toLocaleString("en-US");
  if (amount >= 1) return String(Number(amount.toFixed(2)));
  const places = Math.min(12, 2 - Math.floor(Math.log10(amount)));
  return String(Number(amount.toFixed(places)));
}

/**
 * About how much of a token a dollar amount is, for showing before paying. The exact amount is fixed
 * by the backend when the top-up starts; this only tells the person what to expect.
 */
export function tokenAmountEstimate(dollars: number, symbol: string, price: number | undefined): string | null {
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  const unitPrice = symbol === "USDC" ? 1 : price;
  if (unitPrice === undefined || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  return formatEstimate(dollars / unitPrice);
}
