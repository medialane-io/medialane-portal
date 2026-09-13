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
if (typeof (globalThis as { dispatchEvent?: unknown }).dispatchEvent === "undefined") {
  (globalThis as { dispatchEvent: (e: Event) => boolean }).dispatchEvent = () => true;
  (globalThis as { addEventListener: () => void }).addEventListener = () => {};
  (globalThis as { removeEventListener: () => void }).removeEventListener = () => {};
}

const { loadAccountSession, saveAccountSession, clearAccountSession } = await import("./account-session");

beforeEach(() => localStorage.clear());

test("signing in leaves a session this device can read", () => {
  saveAccountSession("account_session_abc.def");
  expect(loadAccountSession()).toBe("account_session_abc.def");
});

test("an account with no session reads as signed out rather than throwing", () => {
  expect(loadAccountSession()).toBeNull();
});

test("signing out takes the session with it", () => {
  saveAccountSession("account_session_abc.def");
  clearAccountSession();
  expect(loadAccountSession()).toBeNull();
});
