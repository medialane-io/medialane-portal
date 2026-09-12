const LABELS: Record<string, string> = {
  "wallet:deploy": "Recipient wallets",
  "intent:mint": "Assets issued",
  "intent:create-tier": "Ticket types created",
  "intent:create-collection": "Collections created",
  "metadata:upload-file": "Images stored",
  "metadata:upload-json": "Details stored",
  "paymaster:invoke-build": "Transaction gas",
  "paymaster:invoke-execute": "Transaction gas",
  "paymaster:deploy-build": "Wallet gas",
  "paymaster:deploy-execute": "Wallet gas",
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
