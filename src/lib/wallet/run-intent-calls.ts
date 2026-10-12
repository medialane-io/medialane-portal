import type { Call } from "starknet";
import type { ApiIntentCreated } from "@medialane/sdk";

export async function runIntentCalls(
  signer: { execute(calls: Call[], opts?: { intentIds?: string[] }): Promise<{ txHash: string }> },
  create: () => Promise<{ data: ApiIntentCreated }>,
): Promise<{ txHash: string }> {
  const intent = (await create()).data as { id: string; calls: Call[] };
  return signer.execute(intent.calls, { intentIds: [intent.id] });
}
