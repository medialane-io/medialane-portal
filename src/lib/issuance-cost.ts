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

export interface CostLine {
  label: string;
  credits: number;
}

export function costOf(pricing: PricingTable | undefined, actionKey: string, service?: string): number {
  if (!pricing) return 0;
  const forService = pricing.rules.find((r) => r.actionKey === actionKey && r.service === service);
  if (forService) return forService.credits;
  const general = pricing.rules.find((r) => r.actionKey === actionKey && r.service === "ALL");
  return general ? general.credits : pricing.default;
}

export function estimateIssuance(
  pricing: PricingTable | undefined,
  input: { recipients: number; hasImage: boolean; service: string },
): { lines: CostLine[]; total: number } {
  if (!pricing || input.recipients < 1) return { lines: [], total: 0 };

  const lines: CostLine[] = [];

  const perRecipient = costOf(pricing, "wallet:deploy");
  lines.push({
    label: `Prepare ${input.recipients} ${input.recipients === 1 ? "recipient" : "recipients"}`,
    credits: perRecipient * input.recipients,
  });

  if (input.hasImage) {
    lines.push({ label: "Store the image", credits: costOf(pricing, "metadata:upload-file") });
  }

  lines.push({ label: "Store the details", credits: costOf(pricing, "metadata:upload-json") });

  if (input.service === "ip-tickets") {
    lines.push({
      label: "Create the ticket",
      credits: costOf(pricing, "intent:create-tier", "ip-tickets"),
    });
  }

  lines.push({ label: "Prepare the issuance", credits: costOf(pricing, "read") });

  return { lines, total: lines.reduce((sum, l) => sum + l.credits, 0) };
}

export function shortfall(total: number, balance: number | undefined): number {
  if (balance === undefined) return 0;
  return Math.max(0, total - balance);
}
