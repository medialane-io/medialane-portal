import { typedData as starknetTypedData } from "starknet";
import { requestSiwsToken } from "@medialane/sdk/starknet";
import { createOwnerKey, signWithPrivateKey, unlockOwnerKey, type SealedOwner } from "./passkey";
import { loadSealedOwner, saveSealedOwner, notifyWalletChange } from "./store";
import { deployWalletSponsored } from "./deploy-relay";
import { deploySelf } from "./self-funded";

export type DeploymentStep = "creating-passkey" | "deploying" | "signing-in";

export interface CompleteWalletDeploymentResult {
  sealed: SealedOwner;
  siwsToken: string;
}

export async function completeWalletDeployment(
  onStep: (step: DeploymentStep) => void,
  options: { forceNew?: boolean } = {},
): Promise<CompleteWalletDeploymentResult> {
  let sealed: SealedOwner | null = options.forceNew ? null : loadSealedOwner();
  let privateKey: string;
  if (!sealed) {
    onStep("creating-passkey");
    const created = await createOwnerKey();
    sealed = created.sealed;
    privateKey = created.privateKeyHex;
    saveSealedOwner(sealed);
  } else {
    
    privateKey = await unlockOwnerKey(sealed);
  }

  onStep("deploying");

  try {
    await deployWalletSponsored(sealed.address, sealed.ownerPubKey, privateKey);
  } catch {
    await deploySelf(sealed.address, sealed.ownerPubKey, privateKey);
  }

  onStep("signing-in");
  const siwsToken = await requestSiwsToken({
    backendUrl: "/api/proxy",
    walletAddress: sealed.address,
    signer: {
      signMessage: async (td) => {
        const msgHash = starknetTypedData.getMessageHash(td, sealed!.address);
        return signWithPrivateKey(privateKey, msgHash);
      },
    },
  });

  notifyWalletChange();

  return { sealed, siwsToken };
}
