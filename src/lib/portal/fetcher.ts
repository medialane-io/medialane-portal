/**
 * Shared SWR fetcher for portal API routes.
 *
 * Throws an ApiError on non-2xx responses so SWR enters the error state
 * and components can display a proper message rather than silently showing
 * stale/empty data.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function portalFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({})) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(res.status, (json?.error as string) ?? `HTTP ${res.status}`);
  }
  return json as T;
}
