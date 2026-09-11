const LABELS: Record<string, string> = {
  "wallet:deploy": "Recipient wallets",
  "paymaster:invoke-build": "Transaction gas",
  "paymaster:invoke-execute": "Transaction gas",
  "paymaster:deploy-build": "Wallet gas",
  "paymaster:deploy-execute": "Wallet gas",
  "metadata:upload-file": "Images stored",
  "metadata:upload-json": "Details stored",
  "metadata:upload-directory": "Folders stored",
  "metadata:signed-url": "Upload links",
  "intent:create-tier": "Tickets created",
  "intent:create-collection": "Collections created",
  "intent:mint": "Issuance prepared",
  "rpc:call": "Chain reads",
  "price:read": "Price lookups",
  "auth:email-send": "Emails sent",
  read: "API reads",
};

export function labelForAction(actionKey: string): string {
  const known = LABELS[actionKey];
  if (known) return known;
  const tail = actionKey.includes(":") ? actionKey.slice(actionKey.indexOf(":") + 1) : actionKey;
  const words = tail.replace(/[-_]/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface ActionSpend {
  actionKey: string;
  credits: number;
  units: number;
}

export interface SpendGroup {
  label: string;
  credits: number;
  units: number;
}

export function groupSpend(rows: ActionSpend[]): SpendGroup[] {
  const byLabel = new Map<string, SpendGroup>();
  for (const row of rows) {
    const label = labelForAction(row.actionKey);
    const seen = byLabel.get(label);
    if (seen) {
      seen.credits += row.credits;
      seen.units += row.units;
    } else {
      byLabel.set(label, { label, credits: row.credits, units: row.units });
    }
  }
  return [...byLabel.values()].sort((a, b) => b.credits - a.credits);
}

export function shareOf(credits: number, total: number): number {
  if (total <= 0) return 0;
  return credits / total;
}
