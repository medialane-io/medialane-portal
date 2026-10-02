import { ApiClient } from "@medialane/sdk";
import { fundingApiFor, type FundingApi } from "@medialane/sdk/starknet";

const PORTAL_PROXY = "/api/proxy";

export function portalFundingApi(mediaWalletToken: string | null, asset?: string): FundingApi {
  const api = fundingApiFor(new ApiClient(PORTAL_PROXY), mediaWalletToken ?? undefined);
  if (!asset || asset === "USDC") return api;
  return {
    ...api,
    createFunding: (input) => api.createFunding({ ...input, params: { ...input.params, asset } }),
  };
}
