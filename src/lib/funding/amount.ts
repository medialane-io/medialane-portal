export function topUpUsdcFor(shortfallCredits: number): string {
  const cents = Math.max(1, Math.ceil(shortfallCredits));
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}
