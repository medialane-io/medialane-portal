export type GroupChoice =
  | { kind: "existing"; collectionId: string; contractAddress: string }
  | { kind: "new"; name: string; symbol: string };

export interface CertificateEmissionForm {
  collection: GroupChoice;
  name: string;
  description: string;
  artwork: File | null;
  guests: string[];
}

export function existingChoice(group: { collectionId: string | null; contractAddress: string }): GroupChoice {
  return { kind: "existing", collectionId: group.collectionId ?? "", contractAddress: group.contractAddress };
}

export function certificateEmissionRunSpec(form: CertificateEmissionForm) {
  return {
    collection: form.collection,
    name: form.name.trim(),
    description: form.description,
    ...(form.artwork ? { artwork: { name: form.artwork.name, size: form.artwork.size, type: form.artwork.type } } : {}),
    guests: form.guests,
  };
}
