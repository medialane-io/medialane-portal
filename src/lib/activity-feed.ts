import type { ApiWalletActivity, ApiActivity } from "@medialane/sdk";

export type MergedActivityItem =
  | { source: "wallet"; timestamp: string; data: ApiWalletActivity }
  | { source: "protocol"; timestamp: string; data: ApiActivity };

export function mergeActivityFeeds(
  walletActivity: ApiWalletActivity[],
  protocolActivity: ApiActivity[],
): MergedActivityItem[] {
  const wallet: MergedActivityItem[] = walletActivity.map((data) => ({ source: "wallet", timestamp: data.timestamp, data }));
  const protocol: MergedActivityItem[] = protocolActivity.map((data) => ({ source: "protocol", timestamp: data.timestamp, data }));
  return [...wallet, ...protocol].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
