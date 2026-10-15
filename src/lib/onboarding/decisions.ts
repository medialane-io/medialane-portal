import { normalizeWalletAddress } from "@medialane/sdk/starknet";
import { z } from "zod";

export type AfterCode =
  | { type: "wallet-setup" }
  | { type: "finish" }
  | { type: "pair-or-recover"; walletAddress: string };

export interface SessionWallet {
  walletAddress: string;
}

export const isEmailAddress = (value: string): boolean => z.string().email().safeParse(value).success;

const sameAddress = (a: string, b: string): boolean => normalizeWalletAddress(a) === normalizeWalletAddress(b);

export function afterCodeVerified(wallet: SessionWallet | null, localAddress: string | null): AfterCode {
  if (!wallet) return { type: "wallet-setup" };
  if (localAddress && sameAddress(localAddress, wallet.walletAddress)) return { type: "finish" };
  return { type: "pair-or-recover", walletAddress: wallet.walletAddress };
}
