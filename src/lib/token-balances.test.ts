import { test, expect } from "bun:test";
import { formatBalance, toAtomic, hasEnough, sortByHoldings } from "./token-balances";

test("a whole balance reads without a decimal point", () => {
  expect(formatBalance(10n ** 18n, 18)).toBe("1");
});

test("a fractional balance is trimmed to something readable", () => {
  expect(formatBalance(28628000000000000000n, 18)).toBe("28.628");
});

test("dust reads as a small number rather than scientific notation", () => {
  expect(formatBalance(1000000000000000n, 18)).toBe("0.001");
});

test("an empty balance reads as zero", () => {
  expect(formatBalance(0n, 18)).toBe("0");
});

test("six decimal tokens format correctly", () => {
  expect(formatBalance(1_500_000n, 6)).toBe("1.5");
});

test("an amount converts to atomic units", () => {
  expect(toAtomic("1", 18)).toBe(10n ** 18n);
  expect(toAtomic("0.5", 6)).toBe(500_000n);
});

test("more precision than the token has is refused", () => {
  expect(toAtomic("0.0000001", 6)).toBeNull();
});

test("nonsense is refused", () => {
  expect(toAtomic("abc", 18)).toBeNull();
  expect(toAtomic("", 18)).toBeNull();
});

test("spending within your balance is allowed", () => {
  expect(hasEnough(10n ** 18n, "0.5", 18)).toBe(true);
});

test("spending more than you hold is caught", () => {
  expect(hasEnough(10n ** 18n, "2", 18)).toBe(false);
});

test("exactly your balance is allowed", () => {
  expect(hasEnough(10n ** 18n, "1", 18)).toBe(true);
});

test("an unknown balance does not block the user", () => {
  expect(hasEnough(undefined, "1000", 18)).toBe(true);
});

test("tokens are ordered by what you hold", () => {
  const order = sortByHoldings({ STRK: 28n * 10n ** 18n, ETH: 0n, USDC: 0n }).map((t) => t.symbol);
  expect(order[0]).toBe("STRK");
});

test("holding nothing keeps a stable order", () => {
  expect(sortByHoldings({}).length).toBeGreaterThan(0);
});
