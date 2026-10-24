import { uploadError } from "@medialane/ui/utils/upload-limits";

export const LICENSE_PRESETS = [
  "All Rights Reserved",
  "CC BY-SA",
  "CC BY",
  "CC BY-NC",
  "CC0",
] as const;

export const AI_POLICIES = ["Allowed", "Training Only", "Not Allowed"] as const;

export const TERRITORIES = ["Worldwide", "Americas", "Europe", "Asia Pacific"] as const;

export function imageRejectionReason(file: File): string | null {
  return uploadError(file, "image");
}

export function maxSupplyFor(recipients: number, entered: string): string | null {
  const trimmed = entered.trim();
  if (!trimmed) return recipients > 0 ? String(recipients) : null;
  if (!/^\d+$/.test(trimmed)) return null;
  const supply = BigInt(trimmed);
  if (supply < BigInt(recipients) || supply > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return supply.toString();
}

export function toUnixSeconds(local: string): number | null {
  if (!local.trim()) return null;
  const ms = new Date(local).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

export function validityError(from: string, until: string): string | null {
  const start = toUnixSeconds(from);
  const end = toUnixSeconds(until);
  if (from.trim() && start === null) return "That start date is not readable.";
  if (until.trim() && end === null) return "That end date is not readable.";
  if (start !== null && end !== null && end <= start) return "It has to end after it starts.";
  return null;
}
