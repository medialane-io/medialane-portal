import {
  interimKeyFor,
  newDerivationSalt,
  buildAndSignDeployment,
  type Recipient,
} from "@/src/lib/provisioning";
import { SERVICE_PAUSED } from "@/src/lib/task-progress";

export type Call = { contractAddress: string; entrypoint: string; calldata: string[] };

export async function provisionOne(secret: Uint8Array, recipient: Recipient, address: string) {
  const derivationSalt = newDerivationSalt();
  const interim = interimKeyFor(secret, recipient, derivationSalt);
  const deployment = await buildAndSignDeployment(address, interim);

  const res = await fetch(`/api/portal/provisioning?address=${address}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientScheme: recipient.scheme,
      recipientValue: recipient.value,
      interimOwnerPubkey: interim.publicKey,
      derivationSalt,
      deployment,
    }),
  });

  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? body?.error ?? `Could not prepare ${recipient.value}`);
  }
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/portal/metadata/upload-file", { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) throw new Error(body?.error ?? "Could not upload the image");
  return (body.data?.url ?? body.data?.uri) as string;
}

export async function pinMetadata(metadata: unknown): Promise<string> {
  const res = await fetch("/api/portal/metadata/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) throw new Error(body?.error ?? "Could not prepare the asset");
  return body.data.url as string;
}

export async function buildTicketType(input: {
  owner: string;
  collection: string;
  maxSupply: string;
  royaltyBps: number;
  metadataUri: string;
  startTime?: number;
  endTime?: number;
}): Promise<{ calls: Call[] }> {
  const res = await fetch("/api/portal/intents/create-tier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "ip-tickets", ...input }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) throw new Error(body?.error ?? "Could not prepare the ticket");
  return { calls: body.data.calls as Call[] };
}

export async function fetchMintCalls(input: {
  service: string;
  owner: string;
  recipients: string[];
  tokenUri?: string;
  collectionId?: string;
  collectionContract?: string;
  tokenId?: string;
  amount?: string;
}): Promise<Call[][]> {
  const res = await fetch("/api/portal/issuance/mint-calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(SERVICE_PAUSED);
  if (!res.ok) {
    if (body?.error === "recipients_not_provisioned") {
      throw new Error(`No wallet yet for ${(body.recipients ?? []).join(", ")}`);
    }
    throw new Error(body?.error ?? "Could not prepare the issuance");
  }
  return body.data.batches as Call[][];
}

export interface SponsorAccount {
  address: string;
  signMessage: (typedData: never) => Promise<unknown>;
}

export async function executeSponsored(
  account: SponsorAccount,
  calls: Call[],
): Promise<string> {
  const built = await fetch("/api/portal/paymaster/invoke/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAddress: account.address, calls }),
  });
  const buildBody = await built.json().catch(() => ({}));
  if (built.status === 402) throw new Error(SERVICE_PAUSED);
  if (!built.ok) throw new Error(buildBody?.error ?? "Could not prepare the transaction");

  const signature = await account.signMessage(buildBody.typedData as never);

  const sent = await fetch("/api/portal/paymaster/invoke/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: account.address,
      typedData: buildBody.typedData,
      signature: Array.isArray(signature) ? signature.map(String) : [String(signature)],
      calls,
    }),
  });
  const sentBody = await sent.json().catch(() => ({}));
  if (sent.status === 402) throw new Error(SERVICE_PAUSED);
  if (!sent.ok) throw new Error(sentBody?.error ?? "Could not send the transaction");

  const hash = sentBody?.transactionHash ?? sentBody?.data?.transactionHash;
  if (!hash) throw new Error("The transaction was sent but no hash came back");
  return hash as string;
}

interface QuoteLine {
  label: string;
  actionKey: string;
  units: number;
  unitCredits: number;
  credits: number;
}

export interface RunQuote {
  lines: QuoteLine[];
  totalCredits: number;
}

export const NOT_ENOUGH_CREDITS = "not_enough_credits";

export async function quoteRun(service: string, recipients: number): Promise<RunQuote> {
  const res = await fetch("/api/portal/launchpad/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, recipients }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? "Could not work out what this run costs");
  return body.data as RunQuote;
}

export async function openRun(service: string, recipients: number): Promise<number> {
  const res = await fetch("/api/portal/launchpad/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, recipients }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new Error(NOT_ENOUGH_CREDITS);
  if (!res.ok) throw new Error(body?.error ?? "Could not start this run");
  return body.data.charged as number;
}
