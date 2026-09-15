import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { getService } from "@medialane/sdk";
import { DATA_TOKENIZATION_SERVICE } from "@/lib/portal-launchpad/collection-copy";
import type { ManifestItem } from "./manifest";

export interface Terms {
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  territory: string;
  aiPolicy: (typeof AI_POLICIES)[number];
  royalty: number;
}

export type CollectionChoice =
  | { kind: "existing"; collectionId: string; contractAddress: string }
  | { kind: "new"; name: string; symbol: string };

export function withPreset(terms: Terms, licenseType: string): Terms {
  const preset = LICENSE_TYPES.find((l) => l.value === licenseType);
  if (!preset) return { ...terms, licenseType };
  return {
    ...terms,
    licenseType: preset.value,
    commercialUse: preset.commercialUse,
    derivatives: preset.derivatives,
    attribution: preset.attribution,
  };
}

export function defaultTerms(): Terms {
  const preset = getService(DATA_TOKENIZATION_SERVICE)?.metadataSchema?.licenseDefault ?? "CC BY-SA";
  const base: Terms = {
    licenseType: "CC BY-SA",
    commercialUse: "Yes",
    derivatives: "Share-Alike",
    attribution: "Required",
    territory: GEOGRAPHIC_SCOPES[0],
    aiPolicy: AI_POLICIES[0],
    royalty: 0,
  };
  return withPreset(base, preset);
}

const fileRef = (file: File) => ({ name: file.name, size: file.size, type: file.type });

export function runSpec(collection: CollectionChoice, terms: Terms, items: ManifestItem[]) {
  return {
    collection,
    terms,
    items: items.map((item) => ({
      name: item.name,
      description: item.description,
      ipType: item.ipType,
      placement: item.placement,
      file: fileRef(item.file),
      ...(item.image ? { image: fileRef(item.image) } : {}),
      traits: item.traits,
    })),
  };
}

export function filesOf(items: ManifestItem[]): Map<string, File> {
  const files = new Map<string, File>();
  for (const item of items) {
    files.set(item.file.name, item.file);
    if (item.image) files.set(item.image.name, item.image);
  }
  return files;
}
