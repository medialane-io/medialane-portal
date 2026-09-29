export const MIN_TOP_UP_USDC = "1";
const MAX_TOP_UP_USDC_CENTS = 10_000 * 100;

/** USDC to top up for a credit shortfall: 100 credits per dollar, rounded up to the cent, never below the minimum. */
export function topUpUsdcFor(shortfallCredits: number): string {
  const cents = Math.min(MAX_TOP_UP_USDC_CENTS, Math.max(100, Math.ceil(shortfallCredits)));
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}
