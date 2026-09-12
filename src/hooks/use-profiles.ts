import { useCollectionProfile as useCollectionProfileBase, useCreatorProfile as useCreatorProfileBase } from "@medialane/ui";
import { getMedialaneClient } from "@/lib/medialane-client";

export function useCollectionProfile(contractAddress: string | undefined) {
  return useCollectionProfileBase(getMedialaneClient, contractAddress);
}

export function useCreatorProfile(walletAddress: string | undefined) {
  return useCreatorProfileBase(getMedialaneClient, walletAddress);
}
