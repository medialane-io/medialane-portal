import { typedData as starknetTypedData, type Call } from "starknet";
import { unlockOwnerKey, signWithPrivateKey, type SealedOwner } from "./passkey";
import { executeSponsored, SponsoredCallRejectedError, type TypedDataSigner } from "./sponsored-executor";
import { requestSelfFundConsent } from "./self-fund-consent";
import { executeSelfFunded } from "./self-funded";
import { walletProvider } from "./provider";
import { norm } from "./account-ops";
import {
  buildSetFirstGuardianCall,
  buildTriggerEscapeOwnerCall,
  buildCompleteEscapeOwnerCall,
  buildCancelEscapeCall,
  getGuardians as sdkGetGuardians,
  getEscape as sdkGetEscape,
  getEscapeSecurityPeriod as sdkGetEscapeSecurityPeriod,
  type GuardianInfo,
  type EscapeInfo,
} from "@medialane/sdk/starknet";

export type { GuardianInfo, EscapeInfo } from "@medialane/sdk/starknet";
export {
  buildSetFirstGuardianCall,
  buildTriggerEscapeOwnerCall,
  buildCompleteEscapeOwnerCall,
  buildCancelEscapeCall,
} from "@medialane/sdk/starknet";

export async function getGuardians(address: string): Promise<GuardianInfo[]> {
  return sdkGetGuardians(walletProvider(), address);
}

export async function getEscape(address: string): Promise<EscapeInfo> {
  return sdkGetEscape(walletProvider(), address);
}

export async function getEscapeSecurityPeriod(address: string): Promise<number> {
  return sdkGetEscapeSecurityPeriod(walletProvider(), address);
}

async function executeGuardianAction(sealed: SealedOwner, calls: Call[], userAddress: string) {
  const priv = await unlockOwnerKey(sealed);
  const signer: TypedDataSigner = {
    address: userAddress,
    signTypedData: async (typedData) => {
      const msgHash = starknetTypedData.getMessageHash(typedData, userAddress);
      return signWithPrivateKey(priv, msgHash);
    },
  };

  const result = await executeSponsored(signer, calls);
  if (result.status === "sponsored") {
    return { transactionHash: result.transactionHash };
  }

  const consented = await requestSelfFundConsent(userAddress, calls);
  if (!consented) {
    throw new SponsoredCallRejectedError(result.reason);
  }
  return executeSelfFunded(userAddress, priv, calls);
}

export async function setFirstGuardian(sealed: SealedOwner, guardianPubkey: string) {
  const { transactionHash } = await executeGuardianAction(
    sealed,
    [buildSetFirstGuardianCall(sealed.address, guardianPubkey)],
    sealed.address,
  );
  return transactionHash;
}

export async function triggerEscapeOwner(
  guardianSealed: SealedOwner,
  targetAddress: string,
  newOwnerPubkey: string,
) {
  const { transactionHash } = await executeGuardianAction(
    guardianSealed,
    [buildTriggerEscapeOwnerCall(targetAddress, newOwnerPubkey)],
    norm(targetAddress),
  );
  return transactionHash;
}

export async function completeEscapeOwner(guardianSealed: SealedOwner, targetAddress: string) {
  const { transactionHash } = await executeGuardianAction(
    guardianSealed,
    [buildCompleteEscapeOwnerCall(targetAddress)],
    norm(targetAddress),
  );
  return transactionHash;
}

export async function cancelEscape(sealed: SealedOwner) {
  const { transactionHash } = await executeGuardianAction(
    sealed,
    [buildCancelEscapeCall(sealed.address)],
    sealed.address,
  );
  return transactionHash;
}
