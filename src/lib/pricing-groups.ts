export interface PricingRule {
  actionKey: string;
  chain: string;
  service: string;
  credits: number;
}

export interface PriceRow {
  actionKey: string;
  label: string;
  credits: number;
}

export interface PriceGroups {
  runs: PriceRow[];
  api: PriceRow[];
}

const RUN_ACTIONS: Record<string, string> = {
  "intent:create-collection": "Create a collection",
  "intent:create-tier": "Create a ticket type",
  "metadata:upload-file": "Upload a file to IPFS",
  "metadata:upload-json": "Upload an item's metadata to IPFS",
  "intent:mint": "Mint an item",
  "wallet:deploy": "Create a wallet for a recipient",
};

const API_ACTIONS: Record<string, string> = {
  read: "Read or query",
  "intent:create-coin": "Deploy a Creator Coin",
  "intent:launch-coin": "Launch a Creator Coin on Ekubo",
  "intent:listing": "List an asset for sale",
  "intent:offer": "Make an offer",
  "intent:cancel": "Cancel an order",
  "intent:fulfill": "Buy an asset",
  "intent:counter-offer": "Counter an offer",
  "intent:checkout": "Checkout",
};

const NOT_SOLD_PREFIXES = ["paymaster:", "launchpad:"];

const isSold = (actionKey: string): boolean => !NOT_SOLD_PREFIXES.some((prefix) => actionKey.startsWith(prefix));

const rowsFor = (labels: Record<string, string>, credits: Map<string, number>): PriceRow[] =>
  Object.entries(labels)
    .filter(([actionKey]) => credits.has(actionKey))
    .map(([actionKey, label]) => ({ actionKey, label, credits: credits.get(actionKey)! }));

export function groupPricing(rules: PricingRule[] | undefined): PriceGroups {
  const credits = new Map<string, number>();
  for (const rule of rules ?? []) {
    if (rule.chain === "ALL" && rule.service === "ALL" && isSold(rule.actionKey)) credits.set(rule.actionKey, rule.credits);
  }
  return { runs: rowsFor(RUN_ACTIONS, credits), api: rowsFor(API_ACTIONS, credits) };
}
