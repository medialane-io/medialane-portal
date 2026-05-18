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
