import { hash } from "starknet";

const TICKET_CREATED_SELECTOR = hash.getSelectorFromName("TicketCreated");

export interface ReceiptEvent {
  from_address?: string;
  keys?: string[];
  data?: string[];
}

export function sameAddress(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  try {
    return BigInt(a) === BigInt(b);
  } catch {
    return false;
  }
}

export function ticketIdFromReceipt(
  events: ReceiptEvent[] | undefined,
  collection: string,
  selector: string = TICKET_CREATED_SELECTOR,
): string | null {
  for (const ev of events ?? []) {
    if (!sameAddress(ev.from_address, collection)) continue;
    if (!sameAddress(ev.keys?.[0], selector)) continue;
    const low = ev.keys?.[1];
    const high = ev.keys?.[2] ?? "0x0";
    if (!low) continue;
    return (BigInt(low) + (BigInt(high) << 128n)).toString();
  }
  return null;
}
