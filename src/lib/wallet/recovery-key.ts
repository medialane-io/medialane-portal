import { computeWalletAddress } from "./account";
import type { SealedOwner } from "./passkey";

export function isRecoveryKeyForWallet(sealed: SealedOwner): boolean {
  try {
    return BigInt(computeWalletAddress(sealed.ownerPubKey, 0)) === BigInt(sealed.address);
  } catch {
    return false;
  }
}
