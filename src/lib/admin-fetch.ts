import { encodeAdminHeaders } from "@medialane/sdk/starknet";
import { toast } from "sonner";
import { getAdminSession } from "@/src/lib/admin-session";

export class NoAdminSessionError extends Error {
  constructor() { super("No admin session"); this.name = "NoAdminSessionError"; }
}

export function adminFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const session = getAdminSession();
  if (!session) throw new NoAdminSessionError();

  const proxyPath = path.startsWith("/api/admin")
    ? path
    : path.replace(/^\/admin(?=\/|$)/, "/api/admin");

  const u = new URL(proxyPath, "http://x");
  const backendPath = u.pathname.replace(/^\/api\/admin/, "/admin") + u.search;
  const method = (opts.method ?? "GET").toUpperCase();
  const body = typeof opts.body === "string" ? opts.body : "";
  const signed = encodeAdminHeaders(session, { method, path: backendPath, body });

  return fetch(proxyPath, {
    ...opts,
    headers: { "Content-Type": "application/json", ...signed, ...(opts.headers as Record<string, string>) },
  });
}

export async function runAdminAction<T = unknown>(
  path: string,
  opts: RequestInit & { success?: string; errorPrefix?: string } = {},
): Promise<T | null> {
  const { success, errorPrefix, ...init } = opts;
  try {
    const res = await adminFetch(path, init);
    const json = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
    if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
    if (success) toast.success(success);
    return json as T;
  } catch (err) {
    const base = err instanceof Error ? err.message : "Unknown error";
    toast.error(errorPrefix ? `${errorPrefix}: ${base}` : base, { duration: 10000 });
    return null;
  }
}
