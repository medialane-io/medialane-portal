import type { CollectionServiceId } from "@medialane/sdk";
import { LAUNCHPAD } from "./services";

export interface CollectionCopy {
  label: string;
  hint: string;
  empty: string;
  countOf: (works: number) => string;
}

export function collectionCopy(serviceId: CollectionServiceId): CollectionCopy {
  if (serviceId === LAUNCHPAD.ticketing.collections) {
    return {
      label: "Group",
      hint: "One per event, or one for everything.",
      empty: "No groups yet",
      countOf: (n) => (n === 0 ? "Nothing issued yet" : `${n.toLocaleString()} issued`),
    };
  }
  if (serviceId === LAUNCHPAD.certificates.collections) {
    return {
      label: "Collection",
      hint: "One per cohort, or one for everything.",
      empty: "No collections yet",
      countOf: (n) => (n === 0 ? "Nothing issued yet" : `${n.toLocaleString()} issued`),
    };
  }
  return {
    label: "Collection",
    hint: "One per project, or one for everything.",
    empty: "No collections yet",
    countOf: (n) => (n === 0 ? "Nothing in it yet" : `${n.toLocaleString()} ${n === 1 ? "item" : "items"}`),
  };
}
