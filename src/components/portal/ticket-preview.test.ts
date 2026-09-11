import { test, expect } from "bun:test";
import { windowLabel } from "./ticket-preview";

test("no window reads as anytime", () => {
  expect(windowLabel("", "")).toBe("anytime");
});

test("both ends read as a range", () => {
  expect(windowLabel("2026-10-01T18:00", "2026-10-03T18:00")).toContain("–");
});

test("only a start reads as from", () => {
  expect(windowLabel("2026-10-01T18:00", "")).toStartWith("from ");
});

test("only an end reads as until", () => {
  expect(windowLabel("", "2026-10-03T18:00")).toStartWith("until ");
});
