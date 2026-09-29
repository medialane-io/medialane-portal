import { ApiClient } from "@medialane/sdk";
import { fundingApiFor, type FundingApi } from "@medialane/sdk/starknet";

const PORTAL_PROXY = "/api/proxy";

/**
 * Only ever pass the signed-in account's own Media Wallet token here. An external wallet's sign-in
 * token must never reach a portal route: the backend would create an account for that wallet.
 *
 * `asset` picks the token to pay with; USDC, the default, needs nothing extra.
 */
export function portalFundingApi(mediaWalletToken: string | null, asset?: string): FundingApi {
  const api = fundingApiFor(new ApiClient(PORTAL_PROXY), mediaWalletToken ?? undefined);
  if (!asset || asset === "USDC") return api;
  return {
    ...api,
    createFunding: (input) => api.createFunding({ ...input, params: { ...input.params, asset } }),
  };
}
