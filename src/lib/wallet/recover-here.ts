import { discoverOwnerKey, PasskeyCancelledError } from "./passkey";
import { isOwnerOf } from "./devices";
import { saveSealedOwner, notifyWalletChange } from "./store";

export type RecoveryOutcome = "recovered" | "not-an-owner" | "unavailable" | "cancelled";

export async function recoverWalletHere(accountAddress: string): Promise<RecoveryOutcome> {
  let discovered;
  try {
    discovered = await discoverOwnerKey();
  } catch (err) {
    return err instanceof PasskeyCancelledError ? "cancelled" : "unavailable";
  }

  let owns: boolean;
  try {
    owns = await isOwnerOf(accountAddress, discovered.ownerPubKey);
  } catch {
    return "unavailable";
  }

  if (!owns) return "not-an-owner";

  saveSealedOwner({ ...discovered, address: accountAddress });
  notifyWalletChange();
  return "recovered";
}
