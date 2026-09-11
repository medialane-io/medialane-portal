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
      label: "Where these tickets go",
      hint: "One for each event, or one for everything. However you like to organise them.",
      empty: "Make a place to keep your tickets.",
      create: "New group",
      countOf: (n) => (n === 0 ? "Nothing issued yet" : `${n.toLocaleString()} issued`),
    };
  }
  return {
    label: "Where this goes",
    hint: "Group your work however suits you.",
    empty: "Make a place to keep your work.",
    create: "New collection",
    countOf: (n) => (n === 0 ? "Nothing in it yet" : `${n.toLocaleString()} ${n === 1 ? "item" : "items"}`),
  };
}
