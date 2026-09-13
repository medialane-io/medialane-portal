import { z } from "zod";

export const LICENSE_PRESETS = [
  "All Rights Reserved",
  "CC BY-SA",
  "CC BY",
  "CC BY-NC",
  "CC0",
] as const;

export const AI_POLICIES = ["Allowed", "Training Only", "Not Allowed"] as const;

export const TERRITORIES = ["Worldwide", "Americas", "Europe", "Asia Pacific"] as const;

export const IP_TYPES = [
  "Dataset",
  "Document",
  "Audio",
  "Video",
  "Image",
  "Software",
  "Other",
] as const;

export const issuanceSchema = z.object({
  collectionId: z.string().min(1, "Choose a collection"),
  name: z.string().min(1, "Name required").max(120),
  description: z.string().max(2000).optional(),
  externalUrl: z
    .string()
    .refine((v) => !v || v.startsWith("http://") || v.startsWith("https://"), {
      message: "Must start with http:// or https://",
    })
    .optional(),
  ipType: z.enum(IP_TYPES),
  licenseType: z.enum(LICENSE_PRESETS),
  aiPolicy: z.enum(AI_POLICIES),
  commercialUse: z.enum(["Yes", "No"]),
  derivatives: z.enum(["Allowed", "Not Allowed", "Share-Alike"]),
  attribution: z.enum(["Required", "Not Required"]),
  geographicScope: z.enum(TERRITORIES),
  royalty: z.coerce.number().min(0).max(50),
  recipients: z.string().min(1, "Add at least one recipient"),
});

export type IssuanceValues = z.infer<typeof issuanceSchema>;

export const ISSUANCE_DEFAULTS: IssuanceValues = {
  collectionId: "",
  name: "",
  description: "",
  externalUrl: "",
  ipType: "Dataset",
  licenseType: "All Rights Reserved",
  aiPolicy: "Not Allowed",
  commercialUse: "No",
  derivatives: "Not Allowed",
  attribution: "Required",
  geographicScope: "Worldwide",
  royalty: 0,
  recipients: "",
};

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

export function termsSummary(values: Pick<IssuanceValues, "licenseType" | "aiPolicy">): string {
  const ai = values.aiPolicy === "Not Allowed" ? "No AI use" : `AI ${values.aiPolicy.toLowerCase()}`;
  return `${values.licenseType} · ${ai}`;
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
