import { NextRequest, NextResponse } from "next/server";
import { isTransientRpcError } from "@medialane/sdk";
import { RPC_MAIN_URL, RPC_FALLBACK_URL } from "@/src/lib/constants";

/**
 * Server-side Starknet RPC proxy.
 *
 * Keeps the keyed RPC key OUT of the browser bundle (this replaces a prior
 * NEXT_PUBLIC_RPC_URL that inlined the keyed Alchemy URL directly into the
 * client — the same class of leak medialane-starknet fixed on 2026-06-23).
 * The portal's client RPC provider (`starknet-provider-wrapper.tsx`) points at
 * this same-origin route; the keyed URL lives only in the server-only
 * STARKNET_RPC_URL var (`src/lib/constants.ts`, the single source). MAIN stays
 * the PRIMARY upstream; on a transient failure it rotates to the keyless
 * public FALLBACK (lava).
 *
 * The portal has no user session to gate this on. Abuse protection:
 *  - same-origin guard: reject browser requests whose Origin is a different
 *    host (the realistic cross-origin abuse vector). Requests without an
 *    Origin (non-CORS / SSR) are allowed.
 *  - method allowlist: reads + the one write path the portal actually uses
 *    (the Credits tab's USDC top-up `account.execute`, `credits-tab.tsx`).
 *  - per-IP rate limit bounds residual abuse from a same-origin script.
 *  - credit metering: every forwarded call bills the backend's metered
 *    POST /v1/rpc/meter first (medialane-backend/src/api/routes/rpc-meter.ts)
 *    — mirrors medialane-io and medialane-starknet's /api/rpc, which this
 *    route had drifted out of sync with (this proxy forwarded to the keyed
 *    Alchemy upstream with no billing at all). The RPC call itself still
 *    goes straight to the upstream with this app's own key below; billing
 *    only makes it a credited action instead of a free bypass.
 */

const RPC_URLS = Array.from(new Set(
  [RPC_MAIN_URL, RPC_FALLBACK_URL].filter((url): url is string => Boolean(url)),
));

const ALLOWED_METHODS = new Set([
  // ── Write — Credits tab USDC top-up (account.execute) ────────────────────
  "starknet_addInvokeTransaction",
  // ── Transaction lifecycle ─────────────────────────────────────────────────
  "starknet_getTransactionReceipt",
  "starknet_getTransactionStatus",
  "starknet_getTransactionByHash",
  "starknet_getTransaction",
  "starknet_getBlockWithReceipts",
  // ── Fee estimation & nonce ────────────────────────────────────────────────
  "starknet_estimateFee",
  "starknet_getNonce",
  "starknet_simulateTransactions",
  // ── Provider initialisation (called automatically by starknet.js / starknet-react) ──
  "starknet_specVersion",
  "starknet_chainId",
  "starknet_blockNumber",
  "starknet_blockHashAndNumber",
  // ── Reads ─────────────────────────────────────────────────────────────────
  "starknet_call",
  "starknet_getBlockWithTxHashes",
  "starknet_getBlockWithTxs",
  "starknet_getClassAt",
  "starknet_getClass",
  "starknet_getClassHashAt",
  "starknet_getStorageAt",
  "starknet_getEvents",
]);

function isAllowedMethod(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.every((item) => isAllowedMethod(item));
  }
  if (body && typeof body === "object") {
    const method = (body as Record<string, unknown>).method;
    return typeof method === "string" && ALLOWED_METHODS.has(method);
  }
  return false;
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // no Origin (SSR / non-CORS) → allow
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function rpcError(code: number, message: string, status = 200, id: number | null = null) {
  return NextResponse.json(
    { jsonrpc: "2.0", error: { code, message }, id },
    { status },
  );
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 600;
const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function extractMethod(body: unknown): string {
  if (Array.isArray(body)) return "batch";
  if (body && typeof body === "object") {
    const method = (body as Record<string, unknown>).method;
    if (typeof method === "string") return method;
  }
  return "unknown";
}

/**
 * Bill this app's credit balance for the upcoming upstream RPC call, via the
 * backend's metered POST /v1/rpc/meter (medialane-backend/src/api/routes/rpc-meter.ts).
 * The RPC call itself still goes straight to the upstream with this app's own
 * key below — this only makes it a credited action instead of a free bypass.
 * Returns false (caller must refuse to forward) on insufficient credits or
 * any billing failure — an RPC call this app can't account for must not run.
 */
async function billRpcCall(method: string): Promise<boolean> {
  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiUrl || !apiKey) {
    console.error("[/api/rpc] MEDIALANE_API_URL/MEDIALANE_API_KEY are not configured — refusing to bill/forward");
    return false;
  }
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/rpc/meter`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ method }),
    });
    return res.ok;
  } catch (err) {
    console.error("[/api/rpc] billing call failed", { err: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return rpcError(-32600, "Cross-origin requests are not allowed", 403);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return rpcError(-32005, "Too many requests", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return rpcError(-32700, "Parse error");
  }

  if (!isAllowedMethod(body)) {
    const method = !Array.isArray(body) && body && typeof body === "object"
      ? String((body as Record<string, unknown>).method ?? "<unknown>")
      : "<batch or invalid>";
    return rpcError(-32601, `Method not allowed: ${method}`);
  }

  const method = extractMethod(body);
  if (!(await billRpcCall(method))) {
    return rpcError(-32003, "Insufficient credits or billing unavailable — RPC call not forwarded", 402);
  }

  let lastError = "No RPC upstream configured";

  for (const rpcUrl of RPC_URLS) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      const upstream = rpcUrl.split("/")[2];
      if (!text) {
        lastError = `Upstream RPC returned empty body (HTTP ${response.status})`;
        console.warn("[/api/rpc] upstream returned empty body", { status: response.status, upstream });
        continue;
      }

      try {
        const data = JSON.parse(text);

        if (isTransientRpcError({ status: response.status, body: data })) {
          const errObj = (data as { error?: { code?: unknown; message?: unknown } }).error;
          lastError = `Upstream RPC returned transient JSON-RPC error: ${String(errObj?.message ?? "(no message)")}`;
          console.warn("[/api/rpc] upstream returned transient JSON-RPC error", {
            upstream, code: errObj?.code, message: errObj?.message,
          });
          continue;
        }

        return NextResponse.json(data, { status: 200 });
      } catch {
        lastError = `Upstream RPC returned non-JSON (HTTP ${response.status})`;
        console.warn("[/api/rpc] upstream returned non-JSON", {
          status: response.status, upstream, bodyPreview: text.slice(0, 200),
        });
        continue;
      }
    } catch (err) {
      lastError = `Upstream RPC unreachable: ${err instanceof Error ? err.message : "unknown error"}`;
      console.warn("[/api/rpc] upstream fetch failed", {
        upstream: rpcUrl.split("/")[2],
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return rpcError(-32603, lastError);
}
