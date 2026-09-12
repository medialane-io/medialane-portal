import { typedData as starknetTypedData, type Call } from "starknet";
import {
  computeOwnerGuid,
  buildAddOwnerCall,
  buildRemoveOwnerByGuidCall,
  getOwners as sdkGetOwners,
  type GuardianInfo,
} from "@medialane/sdk/starknet";
import { unlockOwnerKey, signWithPrivateKey, type SealedOwner } from "./passkey";
import { executeSponsored, SponsoredCallRejectedError, type TypedDataSigner } from "./sponsored-executor";
import { requestSelfFundConsent } from "./self-fund-consent";
import { executeSelfFunded } from "./self-funded";
import { walletProvider } from "./provider";

export interface DeviceEntry {
  guid: string;
  type: GuardianInfo["type"];
  isThisDevice: boolean;
}

export function describeDevices(owners: GuardianInfo[], thisDevicePubkey: string): DeviceEntry[] {
  const mine = computeOwnerGuid(thisDevicePubkey);
  return owners.map((o) => ({
    guid: o.guid,
    type: o.type,
    isThisDevice: BigInt(o.guid) === BigInt(mine),
  }));
}

export function canRemoveDevice(devices: DeviceEntry[], guid: string): boolean {
  if (devices.length <= 1) return false;
  return devices.some((d) => BigInt(d.guid) === BigInt(guid));
}

export async function getOwners(address: string): Promise<GuardianInfo[]> {
  return sdkGetOwners(walletProvider(), address);
}

async function executeOwnerAction(sealed: SealedOwner, calls: Call[]): Promise<string> {
  const priv = await unlockOwnerKey(sealed);
  const signer: TypedDataSigner = {
    address: sealed.address,
    signTypedData: async (typedData) => {
      const msgHash = starknetTypedData.getMessageHash(typedData, sealed.address);
      return signWithPrivateKey(priv, msgHash);
    },
  };

  const result = await executeSponsored(signer, calls);
  if (result.status === "sponsored") return result.transactionHash;

  const consented = await requestSelfFundConsent(sealed.address, calls);
  if (!consented) throw new SponsoredCallRejectedError(result.reason);
  const { transactionHash } = await executeSelfFunded(sealed.address, priv, calls);
  return transactionHash;
}

export async function addDevice(sealed: SealedOwner, devicePubkey: string): Promise<string> {
  return executeOwnerAction(sealed, [buildAddOwnerCall(sealed.address, devicePubkey)]);
}

export async function removeDevice(sealed: SealedOwner, ownerGuid: string): Promise<string> {
  return executeOwnerAction(sealed, [buildRemoveOwnerByGuidCall(sealed.address, ownerGuid)]);
}

export async function isOwnerOf(accountAddress: string, devicePubkey: string): Promise<boolean> {
  const owners = await getOwners(accountAddress);
  const guid = BigInt(computeOwnerGuid(devicePubkey));
  return owners.some((o) => BigInt(o.guid) === guid);
}
