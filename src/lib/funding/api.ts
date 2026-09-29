import { ApiClient } from "@medialane/sdk";
import { fundingApiFor, type FundingApi } from "@medialane/sdk/starknet";

const PORTAL_PROXY = "/api/proxy";

/**
 * Only ever pass the signed-in account's own Media Wallet token here. An external wallet's sign-in
 * token must never reach a /v1/portal route: the backend would create an account for that wallet.
 */
export function portalFundingApi(mediaWalletToken: string | null): FundingApi {
  return fundingApiFor(new ApiClient(PORTAL_PROXY), mediaWalletToken ?? undefined);
}
