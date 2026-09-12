import { discoverOwnerKey, PasskeyCancelledError } from "./passkey";
import { saveSealedOwner, notifyWalletChange } from "./store";

export type RecoveryOutcome = "recovered" | "different-wallet" | "unavailable" | "cancelled";

export async function recoverWalletHere(accountAddress: string): Promise<RecoveryOutcome> {
  let discovered;
  try {
    discovered = await discoverOwnerKey();
  } catch (err) {
    return err instanceof PasskeyCancelledError ? "cancelled" : "unavailable";
  }

  if (!sameAddress(discovered.address, accountAddress)) return "different-wallet";

  saveSealedOwner(discovered);
  notifyWalletChange();
  return "recovered";
}

export function sameAddress(a: string, b: string): boolean {
  try {
    return BigInt(a) === BigInt(b);
  } catch {
    return false;
  }
}
