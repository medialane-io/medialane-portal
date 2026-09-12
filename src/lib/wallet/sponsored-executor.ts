import type { Call } from "starknet";
import {
  executeSponsored as sdkExecuteSponsored,
  type TypedDataSigner,
  type SponsoredExecuteResult,
} from "@medialane/sdk/starknet";

export { SponsoredCallRejectedError, type TypedDataSigner, type SponsoredExecuteResult } from "@medialane/sdk/starknet";

const PROXY_URL = "/api/wallet/sponsored-invoke";

export function executeSponsored(signer: TypedDataSigner, calls: Call[]): Promise<SponsoredExecuteResult> {
  return sdkExecuteSponsored({ proxyUrl: PROXY_URL }, signer, calls);
}
