import { describe, expect, test } from "bun:test";
import { FundingTransferNotSentError, PasskeyCancelledError } from "@medialane/sdk/starknet";
import { isUserRejection, mediaWalletFundingWallet } from "./wallets";

const call = { contractAddress: "0xusdc", entrypoint: "transfer" as const, calldata: ["0xt", "5", "0"] };
const intentStub = async () => ({ id: "fund", calls: [call] });
const signer = (over: Record<string, unknown> = {}) =>
  ({ address: "0xabc", signTypedData: async () => ["0x1", "0x2"], execute: async () => ({ txHash: "0xself" }), ...over }) as never;

describe("Media Wallet as a funding wallet", () => {
  test("signs with the wallet and sends the transfer sponsored", async () => {
    const wallet = mediaWalletFundingWallet(signer(), async () => ({ status: "sponsored", transactionHash: "0xsp" }), undefined, intentStub);
    expect(wallet.address).toBe("0xabc");
    expect(await wallet.signTypedData({} as never)).toEqual(["0x1", "0x2"]);
    expect(await wallet.sendTransfer(call)).toEqual({ txHash: "0xsp" });
  });

  test("no sponsor available means nothing was sent", async () => {
    const wallet = mediaWalletFundingWallet(signer(), async () => ({ status: "unavailable", reason: "busy" }), undefined, intentStub);
    await expect(wallet.sendTransfer(call)).rejects.toBeInstanceOf(FundingTransferNotSentError);
  });

  test("a cancelled passkey prompt means nothing was sent", async () => {
    const wallet = mediaWalletFundingWallet(signer(), async () => { throw new PasskeyCancelledError(); }, undefined, intentStub);
    await expect(wallet.sendTransfer(call)).rejects.toBeInstanceOf(FundingTransferNotSentError);
  });

  test("the transfer runs as the backend's funding intent with its id", async () => {
    const created: unknown[] = [];
    const sent: unknown[] = [];
    const intentCalls = [{ contractAddress: "0xusdc", entrypoint: "transfer", calldata: ["0xtreasury", "5", "0"] }];
    const wallet = mediaWalletFundingWallet(
      signer(),
      async (_s, calls, ids) => { sent.push({ calls, ids }); return { status: "sponsored", transactionHash: "0xsp" }; },
      async () => 10n ** 30n,
      async (params) => { created.push(params); return { id: "fund1", calls: intentCalls }; },
    );
    expect(await wallet.sendTransfer(call)).toEqual({ txHash: "0xsp" });
    expect(created).toEqual([{ owner: "0xabc", asset: "0xusdc", amountAtomic: "5" }]);
    expect(sent).toEqual([{ calls: intentCalls, ids: ["fund1"] }]);
  });

  test("any other failure is left as it is, because a transfer may have gone out", async () => {
    const wallet = mediaWalletFundingWallet(signer(), async () => { throw new Error("network dropped"); }, undefined, intentStub);
    await expect(wallet.sendTransfer(call)).rejects.toThrow("network dropped");
    await expect(wallet.sendTransfer(call)).rejects.not.toBeInstanceOf(FundingTransferNotSentError);
  });
});

describe("recognising a wallet rejection", () => {
  test("by the standard 4001 code or by the words wallets use", () => {
    expect(isUserRejection({ code: 4001 })).toBe(true);
    expect(isUserRejection(new Error("User rejected the request"))).toBe(true);
    expect(isUserRejection(new Error("Transaction declined by user"))).toBe(true);
    expect(isUserRejection(new Error("Request cancelled"))).toBe(true);
  });
  test("but not a network or contract failure", () => {
    expect(isUserRejection(new Error("network dropped"))).toBe(false);
    expect(isUserRejection(new Error("execution reverted"))).toBe(false);
    expect(isUserRejection(undefined)).toBe(false);
  });
});

describe("a wallet that cannot cover the transfer", () => {
  const STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  const big = { contractAddress: STRK, entrypoint: "transfer" as const, calldata: ["0xt", "2300000000000000000", "0"] };

  test("Media Wallet is never asked to send, and the top-up can be closed", async () => {
    let sent = false;
    const wallet = mediaWalletFundingWallet(
      signer(),
      async () => { sent = true; return { status: "sponsored", transactionHash: "0xsp" }; },
      async () => 1n,
      intentStub,
    );
    await expect(wallet.sendTransfer(big)).rejects.toBeInstanceOf(FundingTransferNotSentError);
    expect(sent).toBe(false);
  });

  test("a wallet with enough is unchanged", async () => {
    const wallet = mediaWalletFundingWallet(
      signer(),
      async () => ({ status: "sponsored", transactionHash: "0xsp" }),
      async () => 3_000_000_000_000_000_000n,
      intentStub,
    );
    expect(await wallet.sendTransfer(big)).toEqual({ txHash: "0xsp" });
  });
});
