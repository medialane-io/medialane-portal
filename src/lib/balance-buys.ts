import { costOf, type PricingTable } from "./issuance-cost";

export interface Affordance {
  label: string;
  count: number;
}

export function whatItBuys(pricing: PricingTable | undefined, balance: number): Affordance[] {
  if (!pricing || balance <= 0) return [];

  const perRecipient = costOf(pricing, "wallet:deploy");
  const perCollection = costOf(pricing, "intent:create-collection");
  const perTicket = costOf(pricing, "intent:create-tier", "ip-tickets");

  const out: Affordance[] = [];
  if (perRecipient > 0) out.push({ label: "recipients", count: Math.floor(balance / perRecipient) });
  if (perCollection > 0) out.push({ label: "collections", count: Math.floor(balance / perCollection) });
  if (perTicket > 0) out.push({ label: "ticket types", count: Math.floor(balance / perTicket) });

  return out.filter((a) => a.count > 0);
}

export function runwayLine(affordances: Affordance[]): string | null {
  if (affordances.length === 0) return null;
  const best = affordances[0];
  return `about ${best.count.toLocaleString()} ${best.count === 1 ? best.label.replace(/s$/, "") : best.label}`;
}
