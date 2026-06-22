import useSWR from "swr";
import type {
  AdminCollectionClaimRecord,
  AdminUsernameClaimRecord,
  AdminCollectionRecord,
  AdminCoinRecord,
  AdminReport,
  AdminTenant,
  AdminApiKey,
  AdminComment,
  AdminSlugClaimRecord,
  RewardAction,
  RewardMultiplier,
  RewardLevel,
  RewardBadge,
} from "@/src/types/admin";
import { encodeAdminHeaders } from "@medialane/sdk";
import { getAdminSession } from "@/src/lib/admin-session";

/** Thrown when there's no valid admin session — the UI prompts a re-sign. */
export class NoAdminSessionError extends Error {
  constructor() { super("No admin session"); this.name = "NoAdminSessionError"; }
}

const adminFetch = (url: string, options?: RequestInit) => {
  const session = getAdminSession();
  if (!session) throw new NoAdminSessionError();
  // `url` is the same-origin forwarder path (/api/admin/<sub>); sign the BACKEND
  // path (/admin/<sub> incl. query) the backend will actually see + verify.
  const u = new URL(url, "http://x");
  const backendPath = u.pathname.replace(/^\/api\/admin/, "/admin") + u.search;
  const method = (options?.method ?? "GET").toUpperCase();
  const body = typeof options?.body === "string" ? options.body : "";
  const signed = encodeAdminHeaders(session, { method, path: backendPath, body });
  return fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...signed, ...(options?.headers as Record<string, string>) },
  });
};

export function useAdminClaims(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-claims-${status}-${page}`,
    () => adminFetch(`/api/admin/claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    claims: (data?.claims ?? []) as AdminCollectionClaimRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminUsernameClaims(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-username-claims-${status}-${page}`,
    () => adminFetch(`/api/admin/username-claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    claims: (data?.claims ?? []) as AdminUsernameClaimRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}


export function useAdminReports(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-reports-${status}-${page}`,
    () => adminFetch(`/api/admin/reports?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    reports: (data?.reports ?? []) as AdminReport[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminCollections(
  filters: {
    service?: string;
    metadataStatus?: string;
    search?: string;
    page?: number;
    isFeatured?: boolean;
    isHidden?: boolean;
  } = {}
) {
  const params = new URLSearchParams({ page: String(filters.page ?? 1), limit: "20" });
  if (filters.service) params.set("service", filters.service);
  if (filters.metadataStatus) params.set("metadataStatus", filters.metadataStatus);
  if (filters.search) params.set("search", filters.search);
  if (filters.isFeatured != null) params.set("isFeatured", String(filters.isFeatured));
  if (filters.isHidden != null) params.set("isHidden", String(filters.isHidden));
  const { data, error, isLoading, mutate } = useSWR(
    `admin-collections-${JSON.stringify(filters)}`,
    () => adminFetch(`/api/admin/collections?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    collections: (data?.collections ?? []) as AdminCollectionRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminTenants() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-tenants",
    () => adminFetch("/api/admin/tenants").then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    tenants: (data?.data ?? []) as AdminTenant[],
    isLoading,
    error,
    mutate,
  };
}

export function useAdminTenantKeys(tenantId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    tenantId ? `admin-tenant-keys-${tenantId}` : null,
    () => adminFetch(`/api/admin/tenants/${tenantId}/keys`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    keys: (data?.data ?? []) as AdminApiKey[],
    isLoading,
    error,
    mutate,
  };
}

export function useAdminComments(hidden?: boolean, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (hidden != null) params.set("hidden", String(hidden));
  const { data, error, isLoading, mutate } = useSWR(
    `admin-comments-${hidden}-${page}`,
    () => adminFetch(`/api/admin/comments?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    comments: (data?.data ?? []) as AdminComment[],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminSlugClaims(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-slug-claims-${status}-${page}`,
    () => adminFetch(`/api/admin/collection-slug-claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    claims: (data?.claims ?? []) as AdminSlugClaimRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminRewardsConfig() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-rewards-config",
    () => adminFetch("/api/admin/rewards/config").then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    actions: (data?.data?.actions ?? []) as RewardAction[],
    multipliers: (data?.data?.multipliers ?? []) as RewardMultiplier[],
    levels: (data?.data?.levels ?? []) as RewardLevel[],
    isLoading,
    error,
    mutate,
  };
}

export function useAdminBadges() {
  const { data, error, isLoading, mutate } = useSWR(
    "admin-rewards-badges",
    () => adminFetch("/api/admin/rewards/badges").then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    badges: (data?.data ?? []) as RewardBadge[],
    isLoading,
    error,
    mutate,
  };
}

export function useAdminCoins(opts: { search?: string; service?: string; page?: number } = {}) {
  const { search = "", service, page = 1 } = opts;
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);
  if (service) params.set("service", service);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-coins-${search}-${service ?? ""}-${page}`,
    () => adminFetch(`/api/admin/coins?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    coins: (data?.coins ?? []) as AdminCoinRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
