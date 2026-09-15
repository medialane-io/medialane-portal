import type { SealedOwner } from "@medialane/sdk/starknet";
import { mediaWallet } from "./client";

export type { GuardianInfo, EscapeInfo } from "@medialane/sdk/starknet";
export {
  buildSetFirstGuardianCall,
  buildTriggerEscapeOwnerCall,
  buildCompleteEscapeOwnerCall,
  buildCancelEscapeCall,
} from "@medialane/sdk/starknet";

export const getGuardians = (address: string) => mediaWallet.getGuardians(address);
export const getEscape = (address: string) => mediaWallet.getEscape(address);
export const getEscapeSecurityPeriod = (address: string) => mediaWallet.getEscapeSecurityPeriod(address);
export const setFirstGuardian = (sealed: SealedOwner, guardianPubkey: string) =>
  mediaWallet.setFirstGuardian(sealed, guardianPubkey);
export const triggerEscapeOwner = (guardianSealed: SealedOwner, targetAddress: string, newOwnerPubkey: string) =>
  mediaWallet.triggerEscapeOwner(guardianSealed, targetAddress, newOwnerPubkey);
export const completeEscapeOwner = (guardianSealed: SealedOwner, targetAddress: string) =>
  mediaWallet.completeEscapeOwner(guardianSealed, targetAddress);
export const cancelEscape = (sealed: SealedOwner) => mediaWallet.cancelEscape(sealed);
