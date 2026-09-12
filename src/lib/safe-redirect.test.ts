import { test, expect } from "bun:test";
import { safeRelativePath } from "./safe-redirect";

const ORIGIN = "https://www.medialane.io";

test("keeps ordinary in-app paths", () => {
  expect(safeRelativePath("/settings")).toBe("/settings");
  expect(safeRelativePath("/asset/starknet/0xabc/1")).toBe("/asset/starknet/0xabc/1");
});

test("rejects protocol-relative escapes", () => {
  expect(safeRelativePath("//evil.com")).toBeNull();
});

test("rejects backslash escapes, which the URL parser treats as slashes", () => {
  expect(safeRelativePath("/\\evil.com")).toBeNull();
  expect(safeRelativePath("/\\/evil.com")).toBeNull();
});

test("rejects absolute and scheme-bearing URLs", () => {
  expect(safeRelativePath("https://evil.com")).toBeNull();
  expect(safeRelativePath("javascript:alert(1)")).toBeNull();
});

test("rejects control characters browsers strip before parsing", () => {
  expect(safeRelativePath("/\tevil.com")).toBeNull();
  expect(safeRelativePath("/\nevil.com")).toBeNull();
});

test("nothing it accepts can resolve to another origin", () => {
  const candidates = [
    "/settings", "//evil.com", "/\\evil.com", "/\\/evil.com",
    "https://evil.com", "/\tevil.com", "/\r\nevil.com", "/ok/path?x=1#y",
  ];
  for (const candidate of candidates) {
    const accepted = safeRelativePath(candidate);
    if (accepted === null) continue;
    expect(new URL(accepted, ORIGIN).origin).toBe(ORIGIN);
  }
});
