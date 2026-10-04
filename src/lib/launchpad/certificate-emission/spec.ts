import { LAUNCHPAD } from "@/lib/launchpad/services";
import { baseTerms, withPreset, type Terms } from "@/lib/launchpad/terms";

export type { Terms };

export type GroupChoice =
  | { kind: "existing"; collectionId: string; contractAddress: string }
  | { kind: "new"; name: string; symbol: string };

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

export { withPreset };

export function defaultTerms(): Terms {
  return baseTerms(LAUNCHPAD.certificates.run);
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
