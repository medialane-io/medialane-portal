import { describe, expect, test } from "bun:test";
import { FundingTransferNotSentError } from "@medialane/sdk/starknet";
import { assertWalletCanCover, formatUnits } from "./balance";

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

  test("a wallet that is short says what it has and what it needs, and nothing was sent", async () => {
    const short = assertWalletCanCover(call(2_300_000_000_000_000_000n), "0xme", async () => 190_247_630_358_657_300n);
    await expect(short).rejects.toBeInstanceOf(FundingTransferNotSentError);
    await expect(short).rejects.toThrow("has 0.190247 STRK");
    await expect(short).rejects.toThrow("needs 2.3 STRK");
  });

  test("reads the full u256 amount from the call", async () => {
    let needed = 0n;
    await assertWalletCanCover(call((1n << 128n) + 5n), "0xme", async () => { needed = (1n << 128n) + 5n; return needed; });
    expect(needed).toBe((1n << 128n) + 5n);
    await expect(assertWalletCanCover(call((1n << 128n) + 5n), "0xme", async () => 5n)).rejects.toBeInstanceOf(FundingTransferNotSentError);
  });

  test("when the balance cannot be read it does not block the payment", async () => {
    await assertWalletCanCover(call(100n), "0xme", async () => { throw new Error("rpc down"); });
  });

  test("a token it does not know still gets a plain message", async () => {
    const short = assertWalletCanCover(call(100n, "0xdead"), "0xme", async () => 1n);
    await expect(short).rejects.toBeInstanceOf(FundingTransferNotSentError);
    await expect(short).rejects.toThrow("enough");
  });
});
