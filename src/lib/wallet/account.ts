import { getCoordinates } from "@medialane/sdk";
import { computeAccountAddress, ownerConstructorCalldata } from "@medialane/sdk/starknet";

export const MEDIAWALLET_CLASS_HASH = getCoordinates("STARKNET").mediaWalletClassHash!;
export const computeWalletAddress = computeAccountAddress;
export { ownerConstructorCalldata };

