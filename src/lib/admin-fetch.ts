import { encodeAdminHeaders } from "@medialane/sdk";
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
