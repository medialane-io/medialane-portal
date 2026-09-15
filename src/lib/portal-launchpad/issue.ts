import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import type { CollectionServiceId } from "@medialane/sdk";
import { getMedialaneClient } from "@/lib/medialane-client";
import { executeIntent, executeIntents, assertTransactionSucceeded } from "@medialane/sdk/starknet";
import { starknetProvider } from "@/lib/starknet";
import {
  interimKeyFor,
  newDerivationSalt,
  buildAndSignDeployment,
  type Recipient,
} from "./provisioning";

export const SERVICE_PAUSED = "service_paused";

export async function provisionOne(secret: Uint8Array, recipient: Recipient): Promise<void> {
  const derivationSalt = newDerivationSalt();
  const interim = interimKeyFor(secret, recipient, derivationSalt);
  const deployment = await buildAndSignDeployment(interim);

  const res = await getMedialaneClient().api.registerBusinessProvisioning({
    chain: "STARKNET",
    recipientScheme: recipient.scheme,
    recipientValue: recipient.value,
    interimOwnerPubkey: interim.publicKey,
    derivationSalt,
    deployment,
  });
  if (!res.data) throw new Error(`Could not prepare a wallet for ${recipient.value}`);
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/proxy/v1/metadata/upload-file", { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) throw new Error(body?.error ?? "Could not upload the image");
  return (body.data?.url ?? body.data?.uri) as string;
}

export async function pinMetadata(metadata: unknown): Promise<string> {
  const res = await fetch("/api/proxy/v1/metadata/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) throw new Error(body?.error ?? "Could not prepare the asset");
  return body.data.url as string;
}

export async function createCollection(
  signer: StarknetVenueSigner,
  input: { owner: string; name: string; symbol: string; service: CollectionServiceId },
): Promise<{ collectionId: string | null; txHash: string }> {
  const client = getMedialaneClient();
  const created = await client.api.createCollectionIntent({ ...input, baseUri: "" });
  if (!created.data) throw new Error("Could not prepare the collection");
  const { txHash } = await executeIntent(starknetProvider, signer, client, created.data);
  return { collectionId: null, txHash };
}

export async function createTicketTier(
  signer: StarknetVenueSigner,
  input: {
    owner: string;
    collection: string;
    service: "ip-ticketing" | "ip-tickets" | "ip-club";
    maxSupply: string;
    royaltyBps: number;
    metadataUri: string;
    startTime?: number;
    endTime?: number;
  },
): Promise<{ txHash: string }> {
  const client = getMedialaneClient();
  const created = await client.api.createTierIntent(input);
  if (!created.data) throw new Error("Could not prepare the ticket type");
  return executeIntent(starknetProvider, signer, client, created.data);
}

export async function issueToRecipients(
  signer: StarknetVenueSigner,
  input: {
    service: string;
    owner: string;
    recipients: string[];
    tokenUri?: string;
    collectionId?: string;
    collectionContract?: string;
    tokenId?: string;
    amount?: string;
  },
): Promise<{ recipientCount: number; txHash: string | null }> {
  const client = getMedialaneClient();
  const result = await client.api.emitToRecipients(input);
  if (!result.data) throw new Error("Could not prepare the issuance");
  const { batches } = result.data;
  if (batches.length === 0) return { recipientCount: result.data.recipientCount, txHash: null };

  let lastTxHash: string | null = null;
  for (const batch of batches) {
    const { txHash } = await signer.execute(batch);
    await assertTransactionSucceeded(starknetProvider, txHash);
    lastTxHash = txHash;
  }
  return { recipientCount: result.data.recipientCount, txHash: lastTxHash };
}

export { executeIntents };
