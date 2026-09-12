export interface PricingRule {
  actionKey: string;
  chain: string;
  service: string;
  credits: number;
}

export interface PricingTable {
  default: number;
  rules: PricingRule[];
}

export interface QuoteLine {
  label: string;
  usd: number;
}

export const MINT_BATCH_SIZE = 25;

export function priceOf(
  pricing: PricingTable | undefined,
  actionKey: string,
  creditsPerUsdc: number,
): number {
  if (!pricing || creditsPerUsdc <= 0) return 0;
  const rule = pricing.rules.find((r) => r.actionKey === actionKey);
  return (rule ? rule.credits : pricing.default) / creditsPerUsdc;
}

export function quoteIssuance(
  pricing: PricingTable | undefined,
  input: { recipients: number; service: string },
  creditsPerUsdc: number,
): { lines: QuoteLine[]; total: number } {
  if (!pricing || input.recipients < 1) return { lines: [], total: 0 };

  const lines: QuoteLine[] = [];

  if (input.service === "ip-tickets") {
    lines.push({ label: "Ticket type", usd: priceOf(pricing, "intent:create-tier", creditsPerUsdc) });
  }

  const people = `${input.recipients} ${input.recipients === 1 ? "person" : "people"}`;
  lines.push({
    label: `Wallets for ${people}`,
    usd: priceOf(pricing, "wallet:deploy", creditsPerUsdc) * input.recipients,
  });
  lines.push({
    label: `Assets for ${people}`,
    usd: priceOf(pricing, "intent:mint", creditsPerUsdc) * input.recipients,
  });

  return { lines, total: lines.reduce((sum, l) => sum + l.usd, 0) };
}

export function perRecipientPrice(pricing: PricingTable | undefined, creditsPerUsdc: number): number {
  return (
    priceOf(pricing, "wallet:deploy", creditsPerUsdc) + priceOf(pricing, "intent:mint", creditsPerUsdc)
  );
}

export function fixedPrice(
  pricing: PricingTable | undefined,
  service: string,
  creditsPerUsdc: number,
): number {
  return service === "ip-tickets" ? priceOf(pricing, "intent:create-tier", creditsPerUsdc) : 0;
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return "under $0.01";
  return `$${amount.toFixed(2)}`;
}
