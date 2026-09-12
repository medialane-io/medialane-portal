"use client";

import {
  useRewards as useRewardsBase,
  useLeaderboard as useLeaderboardBase,
  useRewardsEvents as useRewardsEventsBase,
  useRewardsConfig as useRewardsConfigBase,
  useRewardsBatch as useRewardsBatchBase,
} from "@medialane/ui";
import { getMedialaneClient } from "@/lib/medialane-client";

export type { UserRewards, LeaderboardEntry, BadgeSummary, LevelSummary } from "@medialane/ui";

export function useRewards(address: string | null | undefined) {
  return useRewardsBase(getMedialaneClient, address);
}

export function useLeaderboard(page = 1, limit = 50) {
  return useLeaderboardBase(getMedialaneClient, page, limit);
}

export function useRewardsEvents(address: string | null | undefined, page = 1, limit = 20) {
  return useRewardsEventsBase(getMedialaneClient, address, page, limit);
}

export function useRewardsConfig() {
  return useRewardsConfigBase(getMedialaneClient);
}

export function useRewardsBatch(addresses: string[]) {
  return useRewardsBatchBase(getMedialaneClient, addresses);
}
