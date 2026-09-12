export interface MdlnTier {
  minWholeTokens: number;
  multiplier: number;
}

export interface TierRow {
  range: string;
  multiplier: string;
  rate: string;
}

export function rateFor(creditsPerUsdc: number, multiplier: number): string {
  if (creditsPerUsdc <= 0 || multiplier <= 0) return "—";
  const usd = 1 / (creditsPerUsdc * multiplier);
  const digits = usd < 0.01 ? 4 : 3;
  return `$${usd.toFixed(digits)} / credit`;
}

export function tierRows(tiers: MdlnTier[] | undefined, creditsPerUsdc: number): TierRow[] {
  const earned = (tiers ?? [])
    .filter((t) => t.multiplier > 1)
    .sort((a, b) => a.minWholeTokens - b.minWholeTokens);

  return [
    { range: "0 MDLN", multiplier: "1.0×", rate: rateFor(creditsPerUsdc, 1) },
    ...earned.map((t) => ({
      range: `${t.minWholeTokens.toLocaleString()}+ MDLN`,
      multiplier: `${t.multiplier.toFixed(1)}×`,
      rate: rateFor(creditsPerUsdc, t.multiplier),
    })),
  ];
}
