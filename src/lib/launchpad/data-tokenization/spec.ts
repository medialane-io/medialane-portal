import { LAUNCHPAD } from "@/lib/launchpad/services";
import { newCollectionSpec, type NewCollectionChoice } from "@/lib/launchpad/collection-choice";
import { baseTerms, withPreset, type Terms as BaseTerms } from "@/lib/launchpad/terms";
import type { ManifestItem } from "./manifest";

export interface Terms extends BaseTerms {
  royalty: number;
}

export type CollectionChoice =
  | { kind: "existing"; collectionId: string; contractAddress: string }
  | NewCollectionChoice;

export { withPreset };

export function defaultTerms(): Terms {
  return { ...baseTerms(LAUNCHPAD.dataTokenization.run), royalty: 0 };
}

const fileRef = (file: File) => ({ name: file.name, size: file.size, type: file.type });

export function runSpec(collection: CollectionChoice, terms: Terms, items: ManifestItem[]) {
  return {
    collection: collection.kind === "new" ? newCollectionSpec(collection) : collection,
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
