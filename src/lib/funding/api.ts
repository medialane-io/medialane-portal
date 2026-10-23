import { ApiClient } from "@medialane/sdk";
import { fundingApiFor, type FundingTransferApi } from "@medialane/sdk/starknet";

const PORTAL_PROXY = "/api/proxy";

export function portalFundingApi(asset?: string): FundingTransferApi {
  const funding = fundingApiFor(new ApiClient({ baseUrl: PORTAL_PROXY }));
  if (!asset || asset === "USDC") return funding;
  return {
    ...funding,
    create: (input) => funding.create({ ...input, params: { ...input.params, asset } }),
  };
}
