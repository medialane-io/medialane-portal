import { describe, expect, test } from "bun:test";
import { FundingTransferNotSentError } from "@medialane/sdk/starknet";
import { assertHolds, assertWalletCanCover, formatUnits, InsufficientFundsError, insufficientFundsCopy } from "./balance";

const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const call = (amount: bigint, token = STRK) => ({
  contractAddress: token,
  entrypoint: "transfer" as const,
  calldata: ["0xtreasury", (amount & ((1n << 128n) - 1n)).toString(), (amount >> 128n).toString()],
});

describe("showing an amount of a token", () => {
  test("trims to six places, and never shows a number that misleads", () => {
    expect(formatUnits(190_247_630_358_657_300n, 18, "down")).toBe("0.190247");
    expect(formatUnits(2_300_000_000_000_000_000n, 18, "up")).toBe("2.3");
    expect(formatUnits(1_000_001n, 6, "up")).toBe("1.000001");
    expect(formatUnits(0n, 18, "down")).toBe("0");
    expect(formatUnits(1n, 18, "up")).toBe("0.000001");
  });
});

describe("checking the wallet can cover a transfer before asking it to sign", () => {
  test("a wallet with enough passes", async () => {
    await assertWalletCanCover(call(5_000_000_000_000_000_000n), "0xme", async () => 6_000_000_000_000_000_000n);
  });

  test("a wallet with exactly enough passes", async () => {
    await assertWalletCanCover(call(100n), "0xme", async () => 100n);
  });

  test("a wallet that is short raises a typed error that says what it holds and what is needed", async () => {
    const short = assertWalletCanCover(call(2_300_000_000_000_000_000n), "0xme", async () => 190_247_630_358_657_300n);
    await expect(short).rejects.toBeInstanceOf(InsufficientFundsError);
    await expect(short).rejects.toBeInstanceOf(FundingTransferNotSentError);
    const err = (await short.catch((e) => e)) as InsufficientFundsError;
    expect(err.symbol).toBe("STRK");
    expect(err.have).toBe("0.190247");
    expect(err.amount).toBe("2.3");
  });

  test("reads the full u256 amount from the call", async () => {
    let needed = 0n;
    await assertWalletCanCover(call((1n << 128n) + 5n), "0xme", async () => { needed = (1n << 128n) + 5n; return needed; });
    expect(needed).toBe((1n << 128n) + 5n);
    await expect(assertWalletCanCover(call((1n << 128n) + 5n), "0xme", async () => 5n)).rejects.toBeInstanceOf(InsufficientFundsError);
  });

  test("when the balance cannot be read it does not block the payment", async () => {
    await assertWalletCanCover(call(100n), "0xme", async () => { throw new Error("rpc down"); });
  });

  test("a token it does not know still gets a plain message, without amounts", async () => {
    const err = (await assertWalletCanCover(call(100n, "0xdead"), "0xme", async () => 1n).catch((e) => e)) as InsufficientFundsError;
    expect(err).toBeInstanceOf(InsufficientFundsError);
    expect(err.symbol).toBeNull();
  });
});

describe("checking a wallet holds an amount before anything starts", () => {
  test("enough passes, short raises the typed error, an unreadable balance does not block", async () => {
    await assertHolds(STRK, 100n, "0xme", async () => 100n);
    await expect(assertHolds(STRK, 101n, "0xme", async () => 100n)).rejects.toBeInstanceOf(InsufficientFundsError);
    await assertHolds(STRK, 100n, "0xme", async () => { throw new Error("rpc down"); });
  });

  test("the error carries the amounts in readable units", async () => {
    const err = (await assertHolds(STRK, 2_300_000_000_000_000_000n, "0xme", async () => 0n).catch((e) => e)) as InsufficientFundsError;
    expect([err.symbol, err.have, err.amount]).toEqual(["STRK", "0", "2.3"]);
  });
});

describe("what a person is told when the wallet is short", () => {
  test("names the wallet, and says what they have and what the top-up is", () => {
    expect(insufficientFundsCopy(new InsufficientFundsError("STRK", "0.190247", "2.3"), "your Braavos wallet")).toEqual({
      title: "Not enough STRK in your Braavos wallet",
      body: "You have 0.190247 STRK and this top-up is 2.3 STRK. Add more, lower the amount, or pay with another token.",
    });
  });

  test("a wallet with none of it says so plainly", () => {
    expect(insufficientFundsCopy(new InsufficientFundsError("USDC", "0", "10"), "your Media Wallet")).toEqual({
      title: "No USDC in your Media Wallet",
      body: "This top-up is 10 USDC. Add USDC to it, lower the amount, or pay with another token.",
    });
  });

  test("a token we cannot name still gets a helpful message", () => {
    expect(insufficientFundsCopy(new InsufficientFundsError(null, null, null), "your Braavos wallet")).toEqual({
      title: "Not enough funds in your Braavos wallet",
      body: "Add funds to it, lower the amount, or pay with another token.",
    });
  });

  test("the words never say 'needs'", () => {
    for (const err of [new InsufficientFundsError("ETH", "0.001", "0.05"), new InsufficientFundsError("ETH", "0", "0.05"), new InsufficientFundsError(null, null, null)]) {
      const { title, body } = insufficientFundsCopy(err, "your Braavos wallet");
      expect(`${title} ${body}`).not.toMatch(/needs?\b/i);
    }
  });
});
