export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "HIDDEN" | "DISMISSED" | "RESTORED";

export interface AdminReport {
  id: string;
  targetType: "COLLECTION" | "TOKEN" | "CREATOR";
  targetKey: string;
  targetContract: string | null;
  targetTokenId: string | null;
  targetAddress: string | null;
  reporterUserId: string;
  categories: string[];
  description: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  targetName: string | null;
  targetImage: string | null;
}

export interface AdminCollectionClaimRecord {
  id: string;
  contractAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationMethod: "ONCHAIN" | "SIGNATURE" | "MANUAL";
  claimantAddress?: string;
  claimantEmail?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface AdminUsernameClaimRecord {
  id: string;
  username: string;
  walletAddress: string;
  status: "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
}

export interface AdminTenant {
  id: string;
  name: string;
  email: string;
  plan: "FREE" | "PREMIUM";
  status: "ACTIVE" | "SUSPENDED";
  keyCount: number;
  createdAt: string;
}

export interface AdminApiKey {
  id: string;
  prefix: string;
  label: string;
  appSource: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  monthlyRequestCount: number;
  createdAt: string;
}

export interface AdminComment {
  id: string;
  contractAddress: string;
  tokenId: string;
  author: string;
  content: string;
  txHash: string;
  blockTimestamp: string;
  isHidden: boolean;
  createdAt: string;
}

export interface AdminSlugClaimRecord {
  id: string;
  contractAddress: string;
  slug: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notifyEmail?: string | null;
  adminNotes?: string | null;
  createdAt: string;
}

export interface RewardAction {
  type: string;
  label: string;
  xp: number;
  dailyCap: number | null;
  minValueUsdc: number | null;
  enabled: boolean;
}

export interface RewardMultiplier {
  id: string;
  name: string;
  factor: number;
  enabled: boolean;
  description: string | null;
}

export interface RewardLevel {
  level: number;
  name: string;
  xpRequired: number;
  badgeColor: string;
  description: string | null;
}

export interface RewardBadge {
  key: string;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
  category: string;
  enabled: boolean;
}

export interface AdminCoinRecord {
  id: string;
  contractAddress: string;
  chain: string;
  standard: "ERC20";
  service: string;
  name?: string | null;
  symbol?: string | null;
  decimals: number;
  totalSupply?: string | null;
  description?: string | null;
  image?: string | null;
  creator?: string | null;
  isHidden: boolean;
  createdAt?: string;
}

export interface AdminCollectionRecord {
  id: string;
  name?: string;
  symbol?: string | null;
  contractAddress: string;
  /** @deprecated backend no longer returns this — CollectionSource dropped in Phase 2D.4 */
  source?: string;
  service?: string | null;
  metadataStatus: "FETCHED" | "PENDING" | "FETCHING" | "FAILED";
  standard?: "ERC721" | "ERC1155" | "UNKNOWN";
  isFeatured: boolean;
  isHidden: boolean;
  claimedBy?: string | null;
  image?: string | null;
  totalSupply?: number | null;
  holderCount?: number | null;
  floorPrice?: string | null;
  createdAt?: string;
}
