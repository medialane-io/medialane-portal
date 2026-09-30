import type { WalletRequest } from "@/lib/launchpad/runs-client";
import {
  buildAndSignDeployment,
  type DeploymentBuilder,
  interimKeyFor,
  newDerivationSalt,
  PROVISIONING_SECRET_MESSAGE,
} from "@/lib/portal-launchpad/provisioning";

interface TypedDataSigner {
  signTypedData(data: never): Promise<unknown>;
}

/** One signature from the person's own wallet seeds every guest's interim key, so the keys can be re-derived by them alone. */
export async function provisioningSecret(signer: TypedDataSigner): Promise<Uint8Array> {
  const signature = await signer.signTypedData({
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Provisioning: [{ name: "purpose", type: "shortstring" }],
    },
    primaryType: "Provisioning",
    domain: { name: "Medialane", version: "1", chainId: "SN_MAIN", revision: "1" },
    message: { purpose: PROVISIONING_SECRET_MESSAGE.slice(0, 31) },
  } as never);
  return new TextEncoder().encode(Array.isArray(signature) ? signature.join("") : String(signature));
}

/** The signed request that deploys one guest's wallet, owned by an interim key until they claim it. */
export async function walletRequestFor(
  secret: Uint8Array,
  email: string,
  build: DeploymentBuilder,
): Promise<WalletRequest> {
  const derivationSalt = newDerivationSalt();
  const interim = interimKeyFor(secret, { scheme: "email", value: email }, derivationSalt);
  return {
    recipient: email,
    interimOwnerPubkey: interim.publicKey,
    derivationSalt,
    deployment: await buildAndSignDeployment(interim, build),
  };
}
