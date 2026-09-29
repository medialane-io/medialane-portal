import { getStarknet } from "get-starknet-core";
import { WalletAccount, stark, type TypedData } from "starknet";
import {
  FundingTransferNotSentError,
  PasskeyCancelledError,
  type FundingTransferCall,
  type FundingWallet,
  type StarknetVenueSigner,
} from "@medialane/sdk/starknet";
import { starknetProvider } from "@/lib/starknet";
import { executeSponsored } from "@/lib/wallet/sponsored-executor";
import { assertWalletCanCover, readTokenBalance, type BalanceReader } from "./balance";

export function isUserRejection(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  if ((err as { code?: unknown }).code === 4001) return true;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" && /reject|declin|denied|cancel/i.test(message);
}

export function mediaWalletFundingWallet(
  signer: StarknetVenueSigner,
  sponsored: typeof executeSponsored = executeSponsored,
  readBalance: BalanceReader = readTokenBalance,
): FundingWallet {
  return {
    address: signer.address,
    signTypedData: (typedData) => signer.signTypedData(typedData),
    async sendTransfer(call: FundingTransferCall) {
      await assertWalletCanCover(call, signer.address, readBalance);
      let result;
      try {
        result = await sponsored(signer, [call]);
      } catch (err) {
        if (err instanceof PasskeyCancelledError) {
          throw new FundingTransferNotSentError("You cancelled the transfer.");
        }
        throw err;
      }
      if (result.status !== "sponsored") {
        throw new FundingTransferNotSentError("That transfer could not be sent right now. Try again shortly.");
      }
      return { txHash: result.transactionHash };
    },
  };
}

export interface ExternalWallet {
  id: string;
  name: string;
  icon?: string;
  swo: unknown;
}

export async function listExternalWallets(): Promise<ExternalWallet[]> {
  const wallets = await getStarknet().getAvailableWallets();
  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    icon: typeof w.icon === "string" ? w.icon : undefined,
    swo: w,
  }));
}

export async function connectExternalWallet(
  wallet: ExternalWallet,
  readBalance: BalanceReader = readTokenBalance,
): Promise<FundingWallet> {
  const account = await WalletAccount.connect(starknetProvider, wallet.swo as never);
  if (!account.address) throw new Error("The wallet did not share an address.");
  return {
    address: account.address,
    async signTypedData(typedData: TypedData) {
      try {
        return stark.signatureToHexArray(await account.signMessage(typedData));
      } catch (err) {
        if (isUserRejection(err)) throw new FundingTransferNotSentError("You declined the signature request.");
        throw err;
      }
    },
    async sendTransfer(call: FundingTransferCall) {
      await assertWalletCanCover(call, account.address, readBalance);
      try {
        const { transaction_hash } = await account.execute([call]);
        return { txHash: transaction_hash };
      } catch (err) {
        if (isUserRejection(err)) throw new FundingTransferNotSentError("You declined the transfer.");
        throw err;
      }
    },
  };
}
