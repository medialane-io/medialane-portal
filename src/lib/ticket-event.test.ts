import { test, expect } from "bun:test";
import { capacity, repeatsIn, guestRows, validitySentence } from "./ticket-event";

test("leaving supply empty makes exactly as many as there are people", () => {
  expect(capacity("", 12)).toEqual({ exists: 12, issuingNow: 12, remaining: 0, shortBy: 0 });
});

test("a larger supply leaves room to issue the same ticket later", () => {
  expect(capacity("100", 12)).toMatchObject({ exists: 100, issuingNow: 12, remaining: 88 });
});

test("a supply smaller than the list says how far short it is", () => {
  expect(capacity("5", 12)).toMatchObject({ exists: 5, shortBy: 7, remaining: 0 });
});

test("supply that is not a number falls back to the list size", () => {
  expect(capacity("lots", 4).exists).toBe(4);
});

test("repeats on the guest list are counted rather than dropped silently", () => {
  expect(repeatsIn("a@b.com\na@b.com\nc@d.com")).toBe(1);
  expect(repeatsIn("a@b.com, A@B.com")).toBe(1);
});

test("a clean list has no repeats", () => {
  expect(repeatsIn("a@b.com\nc@d.com")).toBe(0);
});

test("each guest carries whether their address works", () => {
  const rows = guestRows("ana@company.com\nbruno@company");
  expect(rows).toEqual([
    { scheme: "email", value: "ana@company.com", valid: true },
    { scheme: "email", value: "bruno@company", valid: false },
  ]);
});

test("a comma separated paste becomes one guest per row", () => {
  expect(guestRows("a@b.com, c@d.com").length).toBe(2);
});

test("no dates means it is valid whenever", () => {
  expect(validitySentence("", "")).toBe("Valid any time");
});

test("a single day reads as one day", () => {
  expect(validitySentence("2026-09-14T09:00", "2026-09-14T23:00")).toMatch(/^Valid on /);
});

test("a range reads as a range", () => {
  expect(validitySentence("2026-09-14T09:00", "2026-09-16T23:00")).toMatch(/^Valid .+ to .+$/);
});

test("an open ended window reads from or until", () => {
  expect(validitySentence("2026-09-14T09:00", "")).toMatch(/^Valid from /);
  expect(validitySentence("", "2026-09-16T23:00")).toMatch(/^Valid until /);
});
