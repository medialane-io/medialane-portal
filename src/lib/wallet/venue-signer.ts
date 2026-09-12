import { typedData as starknetTypedData, type Call, type TypedData } from "starknet";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import { signWithPrivateKey, unlockOwnerKey, type SealedOwner } from "./passkey";
import { executeSponsored, SponsoredCallRejectedError, type TypedDataSigner } from "./sponsored-executor";
import { requestSelfFundConsent } from "./self-fund-consent";
import { executeSelfFunded } from "./self-funded";

const UNLOCK_TTL_MS = 20_000;
const unlockCache = new Map<string, { promise: Promise<string>; timer: ReturnType<typeof setTimeout> }>();

export function lockVenueSigner(address: string): void {
  const entry = unlockCache.get(address);
  if (!entry) return;
  clearTimeout(entry.timer);
  unlockCache.delete(address);
}

function unlockOnce(sealed: SealedOwner): Promise<string> {
  const existing = unlockCache.get(sealed.address);
  if (existing) return existing.promise;

  const promise = unlockOwnerKey(sealed).catch((err) => {
    lockVenueSigner(sealed.address);
    throw err;
  });
  const timer = setTimeout(() => lockVenueSigner(sealed.address), UNLOCK_TTL_MS);
  unlockCache.set(sealed.address, { promise, timer });
  return promise;
}

export function starknetVenueSigner(sealed: SealedOwner): StarknetVenueSigner {
  return {
    address: sealed.address,
    signTypedData: async (data: TypedData) => {
      const priv = await unlockOnce(sealed);
      return signWithPrivateKey(priv, starknetTypedData.getMessageHash(data, sealed.address));
    },
    execute: async (calls: Call[]) => {
      const priv = await unlockOnce(sealed);
      const signer: TypedDataSigner = {
        address: sealed.address,
        signTypedData: async (typedData) => {
          const msgHash = starknetTypedData.getMessageHash(typedData, sealed.address);
          return signWithPrivateKey(priv, msgHash);
        },
      };

      const result = await executeSponsored(signer, calls);
      if (result.status === "sponsored") {
        return { txHash: result.transactionHash };
      }

      const consented = await requestSelfFundConsent(sealed.address, calls);
      if (!consented) {
        throw new SponsoredCallRejectedError(result.reason);
      }
      const selfFunded = await executeSelfFunded(sealed.address, priv, calls);
      return { txHash: selfFunded.transactionHash };
    },
  };
}
