import { encodeAdminHeaders } from "@medialane/sdk";
import { toast } from "sonner";
import { getAdminSession } from "@/src/lib/admin-session";

/** Thrown when there's no valid admin session — the UI prompts a re-sign. */
export class NoAdminSessionError extends Error {
  constructor() { super("No admin session"); this.name = "NoAdminSessionError"; }
}

/**
 * The ONE way to call the admin API. Signs the request with the admin session
 * key (SNIP-12 session grant) so the backend's adminSignatureAuth can verify it.
 *
 * Accepts either path convention:
 *   - the same-origin forwarder path:  `/api/admin/<sub>`
 *   - the backend path:                `/admin/<sub>`
 * Both are normalized to the forwarder for the actual fetch, and the request is
 * signed over the BACKEND path (`/admin/<sub>` incl. query) the backend verifies.
 *
 * Drop-in for `fetch(path, opts)` — same signature, returns the same Response.
 */
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

/**
 * Run an admin write with consistent, SPECIFIC, readable feedback. On failure it
 * surfaces the backend's `{ error }` message (never a generic "Failed") in a
 * long-lived, dismissible error toast; on success it shows `success`. Returns the
 * parsed response on success, or `null` on failure (already reported).
 *
 *   const r = await runAdminAction(`/admin/coins/${addr}`, { method: "PATCH", body, success: "Coin updated" });
 *   if (r) await mutate();
 */
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
