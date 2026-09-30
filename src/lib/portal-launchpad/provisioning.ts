export interface Recipient {
  scheme: string;
  value: string;
}

export function parseRecipients(raw: string, scheme = "email"): Recipient[] {
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const line of raw.split(/[\n,;]/)) {
    const value = line.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ scheme, value });
  }
  return out;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function invalidRecipients(recipients: Recipient[]): Recipient[] {
  return recipients.filter((r) => r.scheme === "email" && !isValidEmail(r.value));
}
