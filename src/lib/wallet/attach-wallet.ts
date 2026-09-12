import { buildApprovalUrl } from "@medialane/sdk/starknet";
import { createOwnerKey, PasskeyCancelledError, type SealedOwner } from "./passkey";
import { saveSealedOwner, notifyWalletChange } from "./store";
import { isOwnerOf } from "./devices";
import { unlockWalletHere } from "./unlock-here";

const APPROVER_ORIGIN = "https://www.medialane.io";
const APP_NAME = "Medialane Portal";
const PENDING_KEY = "medialane.portal.pending-owner.v1";

export type AttachOutcome = "connected" | "cancelled" | "wrong-passkey" | "unavailable";
export type ApprovalOutcome = "connected" | "unmatched" | "unconfirmed";

function loadPending(): SealedOwner | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as SealedOwner) : null;
  } catch {
    return null;
  }
}

export async function attachWalletHere(account: string): Promise<AttachOutcome> {
  const unlocked = await unlockWalletHere(account);
  if (unlocked === "unlocked") return "connected";
  if (unlocked === "cancelled") return "cancelled";
  if (unlocked === "not-an-owner") return "wrong-passkey";
  return "unavailable";
}

export async function requestAppApproval(returnUrl: string): Promise<"approving" | "cancelled" | "unavailable"> {
  let created;
  try {
    created = await createOwnerKey();
  } catch (e) {
    return e instanceof PasskeyCancelledError ? "cancelled" : "unavailable";
  }

  sessionStorage.setItem(PENDING_KEY, JSON.stringify(created.sealed));
  window.location.href = buildApprovalUrl(APPROVER_ORIGIN, {
    publicKey: created.sealed.ownerPubKey,
    appName: APP_NAME,
    returnUrl,
  });
  return "approving";
}

export async function completePendingApproval(account: string): Promise<ApprovalOutcome> {
  const pending = loadPending();
  if (!pending) return "unmatched";

  if (!(await isOwnerOf(account, pending.ownerPubKey))) return "unconfirmed";

  saveSealedOwner({ ...pending, address: account });
  notifyWalletChange();
  sessionStorage.removeItem(PENDING_KEY);
  return "connected";
}
