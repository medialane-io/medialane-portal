import { test, expect } from "bun:test";
import { formatBalance, toAtomic, hasEnough, sortByHoldings, bestTokenToPayWith, usdValueOf } from "./token-balances";

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
  const order = sortByHoldings(
    { STRK: 28n * 10n ** 18n, ETH: 0n, USDC: 0n },
    { STRK: 0.029, ETH: 2458, USDC: 1 },
  ).map((t) => t.symbol);
  expect(order[0]).toBe("STRK");
});

test("holding nothing keeps a stable order", () => {
  expect(sortByHoldings({}).map((t) => t.symbol)).toEqual(sortByHoldings({}).map((t) => t.symbol));
});

const PRICES = { STRK: 0.029, ETH: 2458, USDC: 1, USDT: 1, WBTC: 60000 };

test("holdings are ranked by what they are worth, not by raw amount", () => {
  const balances = { STRK: 28628000000000000000n, ETH: 1000000000000000n };
  expect(sortByHoldings(balances, PRICES)[0].symbol).toBe("ETH");
});

test("a large holding of a cheap token still wins when it is worth more", () => {
  const balances = { STRK: 28628000000000000000n, ETH: 100000000000n };
  expect(sortByHoldings(balances, PRICES)[0].symbol).toBe("STRK");
});

test("the token you hold most of in dollars is chosen to pay with", () => {
  expect(bestTokenToPayWith({ STRK: 28628000000000000000n }, PRICES)).toBe("STRK");
});

test("holding nothing chooses nothing rather than guessing", () => {
  expect(bestTokenToPayWith({}, PRICES)).toBeNull();
  expect(bestTokenToPayWith({ STRK: 0n }, PRICES)).toBeNull();
});

test("without prices no token is chosen", () => {
  expect(bestTokenToPayWith({ STRK: 28628000000000000000n }, undefined)).toBeNull();
});

test("a dollar value is computed from decimals and price", () => {
  expect(usdValueOf(28628000000000000000n, 18, 0.029)).toBeCloseTo(0.830, 2);
});
