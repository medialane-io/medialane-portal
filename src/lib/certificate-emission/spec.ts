import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { getService } from "@medialane/sdk";

export type GroupChoice =
  | { kind: "existing"; collectionId: string; contractAddress: string }
  | { kind: "new"; name: string; symbol: string };

export interface Terms {
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  territory: string;
  aiPolicy: (typeof AI_POLICIES)[number];
}

export interface CertificateEmissionForm {
  collection: GroupChoice;
  name: string;
  description: string;
  artwork: File | null;
  guests: string[];
  terms: Terms;
}

export function existingChoice(group: { collectionId: string | null; contractAddress: string }): GroupChoice {
  return { kind: "existing", collectionId: group.collectionId ?? "", contractAddress: group.contractAddress };
}

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
  const preset = getService("certificate-emission")?.metadataSchema?.licenseDefault ?? "CC BY-SA";
  const base: Terms = {
    licenseType: "CC BY-SA",
    commercialUse: "Yes",
    derivatives: "Share-Alike",
    attribution: "Required",
    territory: GEOGRAPHIC_SCOPES[0],
    aiPolicy: AI_POLICIES[0],
  };
  return withPreset(base, preset);
}

export function certificateEmissionRunSpec(form: CertificateEmissionForm) {
  return {
    collection: form.collection,
    terms: { ...form.terms, royalty: 0 },
    name: form.name.trim(),
    description: form.description,
    ...(form.artwork ? { artwork: { name: form.artwork.name, size: form.artwork.size, type: form.artwork.type } } : {}),
    guests: form.guests,
  };
}
