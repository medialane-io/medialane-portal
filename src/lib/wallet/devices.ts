import type { SealedOwner } from "@medialane/sdk/starknet";
import { mediaWallet } from "./client";

export { describeDevices, canRemoveDevice, type DeviceEntry } from "@medialane/sdk/starknet";

export const getOwners = (address: string) => mediaWallet.getOwners(address);
export const isOwnerOf = (accountAddress: string, devicePubkey: string) =>
  mediaWallet.isOwnerOf(accountAddress, devicePubkey);
export const addDevice = (sealed: SealedOwner, devicePubkey: string) => mediaWallet.addDevice(sealed, devicePubkey);
export const removeDevice = (sealed: SealedOwner, ownerGuid: string) => mediaWallet.removeDevice(sealed, ownerGuid);
