import { isTicketService } from "./issuance-form";

export interface CollectionCopy {
  label: string;
  hint: string;
  empty: string;
  create: string;
  countOf: (works: number) => string;
}

export function collectionCopy(serviceId: string): CollectionCopy {
  if (isTicketService(serviceId)) {
    return {
      label: "Group",
      hint: "One per event, or one for everything.",
      empty: "No groups yet",
      create: "New group",
      countOf: (n) => (n === 0 ? "Nothing issued yet" : `${n.toLocaleString()} issued`),
    };
  }
  return {
    label: "Collection",
    hint: "One per project, or one for everything.",
    empty: "No collections yet",
    create: "New collection",
    countOf: (n) => (n === 0 ? "Nothing in it yet" : `${n.toLocaleString()} ${n === 1 ? "item" : "items"}`),
  };
}
