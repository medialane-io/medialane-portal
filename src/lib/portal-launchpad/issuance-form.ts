export const LICENSE_PRESETS = [
  "All Rights Reserved",
  "CC BY-SA",
  "CC BY",
  "CC BY-NC",
  "CC0",
] as const;

export const AI_POLICIES = ["Allowed", "Training Only", "Not Allowed"] as const;

export const TERRITORIES = ["Worldwide", "Americas", "Europe", "Asia Pacific"] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export function imageRejectionReason(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, GIF, WebP or SVG file.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That file is over 10 MB.";
  }
  return null;
}

export function maxSupplyFor(recipients: number, entered: string): string | null {
  const trimmed = entered.trim();
  if (!trimmed) return recipients > 0 ? String(recipients) : null;
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (n < recipients) return null;
  return String(n);
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
