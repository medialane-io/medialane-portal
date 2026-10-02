import { toUnixSeconds } from "@/lib/portal-launchpad/issuance-form";

export type GroupChoice = { kind: "existing"; contractAddress: string } | { kind: "new"; name: string; symbol: string };

export interface TicketingForm {
  collection: GroupChoice;
  name: string;
  description: string;
  artwork: File | null;
  validFrom: string;
  validUntil: string;
  supply: string;
  guests: string[];
  terms: {
    licenseType: string;
    aiPolicy: string;
    transferable: string;
    territory: string;
    royalty: string;
  };
}

export function existingChoice(group: { contractAddress: string }): GroupChoice {
  return { kind: "existing", contractAddress: group.contractAddress };
}

export function ticketingRunSpec(form: TicketingForm) {
  const validFrom = toUnixSeconds(form.validFrom);
  const validUntil = toUnixSeconds(form.validUntil);
  const supply = form.supply.trim();

  return {
    collection: form.collection,
    terms: {
      licenseType: form.terms.licenseType,
      commercialUse: "No" as const,
      derivatives: form.terms.transferable === "Allowed" ? ("Allowed" as const) : ("Not Allowed" as const),
      attribution: "Required" as const,
      territory: form.terms.territory,
      aiPolicy: form.terms.aiPolicy,
      royalty: Number(form.terms.royalty) || 0,
      transferable: form.terms.transferable,
    },
    name: form.name.trim(),
    description: form.description,
    ...(form.artwork ? { artwork: { name: form.artwork.name, size: form.artwork.size, type: form.artwork.type } } : {}),
    ...(validFrom !== null ? { validFrom } : {}),
    ...(validUntil !== null ? { validUntil } : {}),
    ...(supply ? { supply: Number(supply) } : {}),
    guests: form.guests,
  };
}
