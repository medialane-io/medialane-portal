import { Account, stark } from "starknet";
import { walletProvider } from "./provider";
import { throwOnErrorResponse } from "@/lib/fetch-error";

export async function deployWalletSponsored(
  ownerAddress: string,
  ownerPubkey: string,
  privateKeyHex: string,
  salt = "0x0",
): Promise<{ transactionHash: string }> {
  const buildRes = await fetch("/api/wallet/deploy-sponsored/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerPubkey, ownerAddress, salt }),
  });
  if (!buildRes.ok) await throwOnErrorResponse(buildRes, "We couldn't prepare your wallet deployment. Please try again.");
  const { typedData, deployment, calls } = (await buildRes.json()) as {
    typedData: object;
    deployment: object;
    calls: object[];
  };

  const account = new Account({
    provider: walletProvider(),
    address: ownerAddress,
    signer: privateKeyHex,
    cairoVersion: "1",
  });
  const rawSignature = await account.signMessage(typedData as never);

  const signature = stark.signatureToHexArray(rawSignature);

  const executeRes = await fetch("/api/wallet/deploy-sponsored/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerAddress, typedData, signature, deployment, calls }),
  });
  if (!executeRes.ok) await throwOnErrorResponse(executeRes, "We couldn't complete your wallet deployment. Please try again.");
  const { transactionHash } = (await executeRes.json()) as { transactionHash: string };
  return { transactionHash };
}
