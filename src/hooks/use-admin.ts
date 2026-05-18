import useSWR from "swr";
import type {
  AdminCollectionClaimRecord,
  AdminUsernameClaimRecord,
  AdminCreatorRecord,
  AdminCollectionRecord,
  AdminReport,
} from "@/src/types/admin";

const adminFetch = (url: string, options?: RequestInit) =>
  fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
  });

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

export function useAdminCreators(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-creators-${status}-${page}`,
    () => adminFetch(`/api/admin/username-claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    creators: (data?.claims ?? []) as AdminCreatorRecord[],
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
