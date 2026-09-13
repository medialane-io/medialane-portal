import { parseRecipients, isValidEmail, type Recipient } from "./provisioning";

export interface Capacity {
  exists: number;
  issuingNow: number;
  remaining: number;
  shortBy: number;
}

export function capacity(entered: string, recipients: number): Capacity {
  const trimmed = entered.trim();
  const exists = /^\d+$/.test(trimmed) ? Number(trimmed) : recipients;
  return {
    exists,
    issuingNow: recipients,
    remaining: Math.max(0, exists - recipients),
    shortBy: Math.max(0, recipients - exists),
  };
}

export function repeatsIn(raw: string): number {
  const entries = raw.split(/[\n,;]/).map((e) => e.trim()).filter(Boolean);
  return entries.length - parseRecipients(raw).length;
}

export interface GuestRow extends Recipient {
  valid: boolean;
}

export function guestRows(raw: string): GuestRow[] {
  return parseRecipients(raw).map((r) => ({ ...r, valid: isValidEmail(r.value) }));
}

function dayLabel(local: string): string {
  const date = new Date(local);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function validitySentence(from: string, until: string): string {
  const hasFrom = from.trim().length > 0;
  const hasUntil = until.trim().length > 0;
  if (!hasFrom && !hasUntil) return "Valid any time";
  if (hasFrom && !hasUntil) return `Valid from ${dayLabel(from)}`;
  if (!hasFrom && hasUntil) return `Valid until ${dayLabel(until)}`;
  const start = dayLabel(from);
  const end = dayLabel(until);
  return start === end ? `Valid on ${start}` : `Valid ${start} to ${end}`;
}
