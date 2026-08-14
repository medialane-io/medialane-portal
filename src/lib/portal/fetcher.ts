
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
