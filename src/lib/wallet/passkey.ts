import { InvalidStarkPrivateKeyError } from "@medialane/sdk/starknet";
import { passkeyOwner } from "./client";

export { PasskeyCancelledError } from "@medialane/sdk/starknet";
export type { SealedOwner, CreatedOwner } from "@medialane/sdk/starknet";
export { InvalidStarkPrivateKeyError };
export { signWithPrivateKey } from "@medialane/sdk/starknet";

export const createOwnerKey = () => passkeyOwner.createOwnerKey();
export const unlockOwnerKey = (sealed: Parameters<typeof passkeyOwner.unlockOwnerKey>[0]) =>
  passkeyOwner.unlockOwnerKey(sealed);
export const sealImportedOwnerKey = (privateKeyInput: string) => passkeyOwner.sealImportedOwnerKey(privateKeyInput);
export const walletAddressForPrivateKey = (privateKeyInput: string) =>
  passkeyOwner.walletAddressForPrivateKey(privateKeyInput);
