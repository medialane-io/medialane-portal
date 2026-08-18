import { NextRequest, NextResponse } from "next/server";
import { isTransientRpcError } from "@medialane/sdk";
import { RPC_MAIN_URL, RPC_FALLBACK_URL } from "@/src/lib/constants";
import { createRateLimiter, clientIp } from "@/src/lib/rate-limit";

const RPC_URLS = Array.from(new Set(
  [RPC_MAIN_URL, RPC_FALLBACK_URL].filter((url): url is string => Boolean(url)),
));

const ALLOWED_METHODS = new Set([

  "starknet_addInvokeTransaction",

  "starknet_getTransactionReceipt",
  "starknet_getTransactionStatus",
  "starknet_getTransactionByHash",
  "starknet_getTransaction",
  "starknet_getBlockWithReceipts",

  "starknet_estimateFee",
  "starknet_getNonce",
  "starknet_simulateTransactions",

  "starknet_specVersion",
  "starknet_chainId",
  "starknet_blockNumber",
  "starknet_blockHashAndNumber",

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
  if (!origin) return true;
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

const checkRateLimit = createRateLimiter(60_000, 600);

function extractMethod(body: unknown): string {
  if (Array.isArray(body)) return "batch";
  if (body && typeof body === "object") {
    const method = (body as Record<string, unknown>).method;
    if (typeof method === "string") return method;
  }
  return "unknown";
}

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

  const ip = clientIp(req);
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
