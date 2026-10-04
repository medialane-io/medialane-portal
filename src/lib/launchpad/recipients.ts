export interface Recipient {
  scheme: string;
  value: string;
}

export function splitEntries(raw: string): string[] {
  const entries: string[] = [];
  let current = "";
  let quoted = false;
  let angled = false;
  for (const char of raw) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && char === "<") angled = true;
    else if (!quoted && char === ">") angled = false;
    const separator = char === "\n" || ((char === "," || char === ";") && !quoted && !angled);
    if (separator) {
      entries.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  entries.push(current);
  return entries.map((e) => e.trim()).filter(Boolean);
}

const addressIn = (entry: string) => entry.match(/<([^<>]+)>\s*$/)?.[1]?.trim() ?? entry;

export function parseRecipients(raw: string, scheme = "email"): Recipient[] {
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const entry of splitEntries(raw)) {
    const value = addressIn(entry);
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
