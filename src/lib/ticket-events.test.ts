import { test, expect } from "bun:test";
import { ticketIdFromReceipt, sameAddress } from "./ticket-events";

import { hash } from "starknet";

const SELECTOR = hash.getSelectorFromName("TicketCreated");
const COLLECTION = "0x0abc";

test("the ticket id is read from the event keys", () => {
  const events = [{ from_address: COLLECTION, keys: [SELECTOR, "0x3", "0x0"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBe("3");
});

test("an unpadded collection address still matches", () => {
  const events = [{ from_address: "0xabc", keys: [SELECTOR, "0x7", "0x0"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBe("7");
});

test("a large id spanning both felts is reassembled", () => {
  const events = [{ from_address: COLLECTION, keys: [SELECTOR, "0x0", "0x1"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBe((1n << 128n).toString());
});

test("an event from another contract is ignored", () => {
  const events = [{ from_address: "0xdead", keys: [SELECTOR, "0x3", "0x0"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBeNull();
});

test("a different event from the same contract is ignored", () => {
  const events = [{ from_address: COLLECTION, keys: ["0xbeef", "0x3", "0x0"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBeNull();
});

test("a receipt with no events yields nothing", () => {
  expect(ticketIdFromReceipt([], COLLECTION, SELECTOR)).toBeNull();
  expect(ticketIdFromReceipt(undefined, COLLECTION, SELECTOR)).toBeNull();
});

test("the first matching event wins", () => {
  const events = [
    { from_address: COLLECTION, keys: [SELECTOR, "0x5", "0x0"], data: [] },
    { from_address: COLLECTION, keys: [SELECTOR, "0x9", "0x0"], data: [] },
  ];
  expect(ticketIdFromReceipt(events, COLLECTION, SELECTOR)).toBe("5");
});

test("addresses compare by value rather than by text", () => {
  expect(sameAddress("0x0abc", "0xabc")).toBe(true);
  expect(sameAddress("0xabc", "0xabd")).toBe(false);
  expect(sameAddress(undefined, "0xabc")).toBe(false);
});

test("the selector is derived from the event name rather than pasted in", () => {
  const events = [{ from_address: COLLECTION, keys: [hash.getSelectorFromName("TicketCreated"), "0x4", "0x0"], data: [] }];
  expect(ticketIdFromReceipt(events, COLLECTION)).toBe("4");
});
