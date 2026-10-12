import {
  executeSponsored as sdkExecuteSponsored,
  type TypedDataSigner,
  type SponsoredExecuteResult,
} from "@medialane/sdk/starknet";

export type { TypedDataSigner, SponsoredExecuteResult } from "@medialane/sdk/starknet";

const PROXY_URL = "/api/proxy/v1/paymaster/invoke";

export function executeSponsored(signer: TypedDataSigner, intentIds: string[]): Promise<SponsoredExecuteResult> {
  return sdkExecuteSponsored({ proxyUrl: PROXY_URL }, signer, { intentIds });
}
