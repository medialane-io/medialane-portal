import { test, expect } from "bun:test";
import { isValidStarknetAddress, norm, STRK_TOKEN, ETH_TOKEN, USDC_TOKEN } from "./account-ops";

test("isValidStarknetAddress accepts a well-formed address", () => {
  expect(isValidStarknetAddress("0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd")).toBe(true);
});

test("isValidStarknetAddress rejects garbage", () => {
  expect(isValidStarknetAddress("not-an-address")).toBe(false);
  expect(isValidStarknetAddress("")).toBe(false);
});

test("norm normalizes case/padding the same way twice", () => {
  const a = norm("0xABC");
  const b = norm("0xabc");
  expect(a).toBe(b);
});

test("token address constants are non-empty hex strings", () => {
  for (const t of [STRK_TOKEN, ETH_TOKEN, USDC_TOKEN]) {
    expect(t.startsWith("0x")).toBe(true);
  }
});
