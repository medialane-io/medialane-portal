import { expect, mock, test } from "bun:test";

const created: string[] = [];
const intent = { id: "f1", calls: [{ contractAddress: "0xusdc", entrypoint: "transfer", calldata: ["0xfund", "5", "0"] }] };
const client = {
  createIntent: async (kind: string) => (created.push(`${kind}:client`), intent),
  api: { intents: { create: async (kind: string) => (created.push(`${kind}:api`), intent) } },
};
mock.module("@/lib/medialane-client", () => ({ getMedialaneClient: () => client }));

const { mediaWalletFundingWallet } = await import("./wallets");

test("a funding transfer is built by the client and sent with its own calls", async () => {
  const sent: unknown[] = [];
  const signer = { address: "0xabc", signTypedData: async () => [], execute: async () => ({ txHash: "0x0" }) } as never;
  const wallet = mediaWalletFundingWallet(
    signer,
    async (_signer, intents) => (sent.push(intents), { status: "sponsored", transactionHash: "0xsp" }),
    async () => 10n ** 30n,
  );
  await wallet.sendTransfer({ contractAddress: "0xusdc", entrypoint: "transfer", calldata: ["0xfund", "5", "0"] });
  expect(created).toEqual(["funding-transfer:client"]);
  expect(sent).toEqual([[intent]]);
});
