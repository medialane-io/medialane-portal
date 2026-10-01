export const TICKETING_SERVICE = "ip-ticketing";
export const DATA_TOKENIZATION_SERVICE = "data-tokenization-erc721";

export function isTicketService(serviceId: string): boolean {
  return serviceId === TICKETING_SERVICE;
}

export interface CollectionCopy {
  label: string;
  hint: string;
  empty: string;
  countOf: (works: number) => string;
}

export function collectionCopy(serviceId: string): CollectionCopy {
  if (isTicketService(serviceId)) {
    return {
      label: "Group",
      hint: "One per event, or one for everything.",
      empty: "No groups yet",
      countOf: (n) => (n === 0 ? "Nothing issued yet" : `${n.toLocaleString()} issued`),
    };
  }
  if (serviceId === "pop-protocol") {
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
