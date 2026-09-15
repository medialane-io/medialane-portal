export type RunStatus = "DRAFT" | "PAID" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface RunQuoteLine {
  action: string;
  units: number;
  unitCredits: number;
  credits: number;
}

export interface RunQuote {
  lines: RunQuoteLine[];
  total: number;
}

export type NextStep =
  | { kind: "collection" }
  | { kind: "wait-collection" }
  | { kind: "upload"; files: string[] }
  | { kind: "metadata"; items: number[] }
  | { kind: "batch"; index: number }
  | { kind: "wait"; index: number }
  | { kind: "done" };

export interface LaunchpadRun {
  id: string;
  service: string;
  status: RunStatus;
  spec: unknown;
  quote: RunQuote | null;
  creditsHeld: number;
  creditsSpent: number;
  progress: unknown;
  next?: NextStep;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmResult {
  pending: boolean;
  status: string;
  completed?: boolean;
}

export class RunRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(message);
  }
}

export type TokenSource = () => Promise<string | null>;

export function runBase(id: string): string {
  return `/api/proxy/v1/portal/runs/${id}`;
}

export function runBatchBase(id: string, index: number): string {
  return `${runBase(id)}/batches/${index}`;
}

export function runCollectionBase(id: string): string {
  return `${runBase(id)}/collection`;
}

export function createRunsClient(getToken: TokenSource, fetchImpl: typeof fetch = fetch) {
  const authorizedFetch: typeof fetch = async (input, init) => {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return fetchImpl(input, { ...init, headers, cache: "no-store" });
  };

  async function call<T>(url: string, init?: RequestInit): Promise<{ status: number; data: T }> {
    const res = await authorizedFetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers as Record<string, string> | undefined) },
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new RunRequestError(String(body.error ?? "Something went wrong with this run"), res.status, body);
    }
    return { status: res.status, data: body.data as T };
  }

  const post = <T>(url: string, body?: unknown) =>
    call<T>(url, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

  return {
    authorizedFetch,

    list: async () => (await call<LaunchpadRun[]>("/api/proxy/v1/portal/runs")).data,

    get: async (id: string) => (await call<LaunchpadRun>(`/api/proxy/v1/portal/runs/${id}`)).data,

    create: async (service: string, spec: unknown) =>
      (await post<LaunchpadRun>("/api/proxy/v1/portal/runs", { service, spec })).data,

    update: async (id: string, spec: unknown) =>
      (await call<LaunchpadRun>(`/api/proxy/v1/portal/runs/${id}`, { method: "PATCH", body: JSON.stringify({ spec }) })).data,

    cancel: async (id: string) => (await post<LaunchpadRun>(`/api/proxy/v1/portal/runs/${id}/cancel`)).data,

    checkoutWithCredits: async (id: string) =>
      (await post<LaunchpadRun>(`/api/proxy/v1/portal/runs/${id}/checkout`, { method: "credits" })).data,

    checkoutFromWallet: async (id: string, txHash: string) =>
      (await post<LaunchpadRun>(`/api/proxy/v1/portal/runs/${id}/checkout`, { method: "wallet", txHash })).data,

    uploadUrl: async (id: string, name: string) =>
      (await post<{ name: string; url: string }>(`/api/proxy/v1/portal/runs/${id}/files/upload-url`, { name })).data.url,

    uploaded: async (id: string, name: string, cid: string) =>
      (await post<{ name: string; uri: string }>(`/api/proxy/v1/portal/runs/${id}/files/uploaded`, { name, cid })).data,

    itemMetadata: async (id: string, index: number, userAddress: string) =>
      (await post<{ index: number; tokenUri: string }>(`/api/proxy/v1/portal/runs/${id}/items/${index}/metadata`, { userAddress })).data,

    confirmBatch: async (id: string, index: number): Promise<ConfirmResult> => {
      const { status, data } = await post<{ status: string; completed?: boolean }>(
        `/api/proxy/v1/portal/runs/${id}/batches/${index}/confirm`,
      );
      return { pending: status === 202, status: data.status, completed: data.completed };
    },

    confirmCollection: async (id: string): Promise<ConfirmResult> => {
      const { status, data } = await post<{ status: string }>(`/api/proxy/v1/portal/runs/${id}/collection/confirm`);
      return { pending: status === 202, status: data.status };
    },
  };
}

export type RunsClient = ReturnType<typeof createRunsClient>;
