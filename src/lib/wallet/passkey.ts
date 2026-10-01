import type { RecoveryKey } from "@medialane/sdk/starknet";
import { passkeyOwner } from "./client";

export { PasskeyCancelledError } from "@medialane/sdk/starknet";
export type { SealedOwner, CreatedOwner } from "@medialane/sdk/starknet";
export { signWithPrivateKey } from "@medialane/sdk/starknet";

export const createOwnerKey = () => passkeyOwner.createOwnerKey();
export const unlockOwnerKey = (sealed: Parameters<typeof passkeyOwner.unlockOwnerKey>[0]) =>
  passkeyOwner.unlockOwnerKey(sealed);
export const sealImportedOwnerKey = (recovery: RecoveryKey) => passkeyOwner.sealImportedOwnerKey(recovery);
