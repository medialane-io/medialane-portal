import type { CollectionChoice } from "@/lib/data-tokenization/spec";
import { toUnixSeconds } from "@/lib/portal-launchpad/issuance-form";

export interface TicketingForm {
  collection: CollectionChoice;
  name: string;
  description: string;
  artwork: File | null;
  /** Local date-time text from the form, or empty. */
  validFrom: string;
  validUntil: string;
  /** How many tickets exist, or empty to match the guest list. */
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

/** Ticket groups made by the factory have no numeric id, so their address stands in for it. */
export function existingChoice(group: { collectionId: string | null; contractAddress: string }): CollectionChoice {
  return { kind: "existing", collectionId: group.collectionId ?? group.contractAddress, contractAddress: group.contractAddress };
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
