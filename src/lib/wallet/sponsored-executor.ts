import type { Call } from "starknet";
import {
  executeSponsored as sdkExecuteSponsored,
  type TypedDataSigner,
  type SponsoredExecuteResult,
} from "@medialane/sdk/starknet";

export type { TypedDataSigner, SponsoredExecuteResult } from "@medialane/sdk/starknet";

const PROXY_URL = "/api/proxy/v1/paymaster/invoke";

export interface SponsoredIntent {
  id: string;
  calls: Call[];
}

export function executeSponsored(signer: TypedDataSigner, intents: SponsoredIntent[]): Promise<SponsoredExecuteResult> {
  return sdkExecuteSponsored({ proxyUrl: PROXY_URL }, signer, {
    intentIds: intents.map((intent) => intent.id),
    calls: intents.flatMap((intent) => intent.calls),
  });
}
