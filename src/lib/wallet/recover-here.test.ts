import { test, expect } from "bun:test";
import { sameAddress } from "./recover-here";

test("the same address written two ways is the same address", () => {
  expect(sameAddress("0x01", "0x1")).toBe(true);
  expect(sameAddress("0x0000000000000000000000000000000000000000000000000000000000000abc", "0xabc")).toBe(true);
});

test("different addresses are not confused for one another", () => {
  expect(sameAddress("0xabc", "0xabd")).toBe(false);
});

test("nonsense never matches, rather than throwing mid sign-in", () => {
  expect(sameAddress("not-an-address", "0x1")).toBe(false);
  expect(sameAddress("", "0x1")).toBe(false);
});
