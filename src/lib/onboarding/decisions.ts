import { normalizeWalletAddress } from "@medialane/sdk/starknet";

export type AfterCode =
  | { type: "wallet-setup" }
  | { type: "finish" }
  | { type: "pair-or-recover"; walletAddress: string }
  | { type: "setup-elsewhere" };

export interface SessionWallet {
  walletAddress: string;
  needsKeySetup: boolean;
}

const sameAddress = (a: string, b: string): boolean => normalizeWalletAddress(a) === normalizeWalletAddress(b);

export function afterCodeVerified(wallet: SessionWallet | null, localAddress: string | null): AfterCode {
  if (!wallet) return { type: "wallet-setup" };
  if (wallet.needsKeySetup) return { type: "setup-elsewhere" };
  if (localAddress && sameAddress(localAddress, wallet.walletAddress)) return { type: "finish" };
  return { type: "pair-or-recover", walletAddress: wallet.walletAddress };
}
