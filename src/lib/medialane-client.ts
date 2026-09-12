import { MedialaneClient } from "@medialane/sdk/starknet";
import {
  STARKNET_MARKETPLACE_721_CONTRACT,
  STARKNET_MARKETPLACE_1155_CONTRACT,
  STARKNET_COLLECTION_721_CONTRACT,
  STARKNET_COLLECTION_1155_CONTRACT,
} from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "./constants";
import { RPC_PRIMARY_URL } from "./starknet";

let _client: MedialaneClient | null = null;

function medialaneConfig() {
  const rpcUrl = RPC_PRIMARY_URL;
  return {
    backendUrl: MEDIALANE_BACKEND_URL,
    apiKey: MEDIALANE_API_KEY || undefined,
    rpcUrl,
    marketplaceContract: STARKNET_MARKETPLACE_721_CONTRACT,
    marketplace1155Contract: STARKNET_MARKETPLACE_1155_CONTRACT,
    collectionContract: STARKNET_COLLECTION_721_CONTRACT,
    collection1155Contract: STARKNET_COLLECTION_1155_CONTRACT,
    chain: "STARKNET" as const,
  };
}

export function getMedialaneClient(): MedialaneClient {
  if (!_client) _client = new MedialaneClient(medialaneConfig());
  return _client;
}
