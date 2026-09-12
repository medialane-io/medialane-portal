import { test, expect, beforeEach } from "bun:test";

if (typeof (globalThis as { window?: unknown }).window === "undefined") {
  (globalThis as { window: unknown }).window = globalThis;
}
if (typeof (globalThis as { localStorage?: unknown }).localStorage === "undefined") {
  const memory = new Map<string, string>();
  (globalThis as { localStorage: Storage }).localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: (index: number) => Array.from(memory.keys())[index] ?? null,
    get length() { return memory.size; },
  };
}

const { loadAccountEmail, saveAccountEmail, clearAccountAddress } = await import("./account-wallet");

beforeEach(() => localStorage.clear());

test("a passkey can be named after the person it belongs to", () => {
  saveAccountEmail("Person@Example.com");
  expect(loadAccountEmail()).toBe("person@example.com");
});

test("the same address written twice keeps one name, so a passkey stays stable", () => {
  saveAccountEmail("person@example.com");
  saveAccountEmail("person@example.com");
  expect(loadAccountEmail()).toBe("person@example.com");
});

test("blank input leaves the stored name alone", () => {
  saveAccountEmail("person@example.com");
  saveAccountEmail("   ");
  expect(loadAccountEmail()).toBe("person@example.com");
});

test("signing out takes the name with it", () => {
  saveAccountEmail("person@example.com");
  clearAccountAddress();
  expect(loadAccountEmail()).toBeNull();
});
