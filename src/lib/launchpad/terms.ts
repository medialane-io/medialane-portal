import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { getService, type ServiceId } from "@medialane/sdk";

export interface Terms {
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  territory: string;
  aiPolicy: (typeof AI_POLICIES)[number];
}

export function withPreset<T extends Terms>(terms: T, licenseType: string): T {
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

export function baseTerms(service: ServiceId): Terms {
  const preset = getService(service)?.metadataSchema?.licenseDefault ?? "CC BY-SA";
  return withPreset(
    {
      licenseType: "CC BY-SA",
      commercialUse: "Yes",
      derivatives: "Share-Alike",
      attribution: "Required",
      territory: GEOGRAPHIC_SCOPES[0],
      aiPolicy: AI_POLICIES[0],
    },
    preset,
  );
}
