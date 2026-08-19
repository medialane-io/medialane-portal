import { NextRequest } from "next/server";
import { createRpcProxyHandler } from "@medialane/sdk";
import { RPC_MAIN_URL, RPC_FALLBACK_URL } from "@/src/lib/constants";
import { createRateLimiter } from "@/src/lib/rate-limit";

const RPC_URLS = Array.from(new Set(
  [RPC_MAIN_URL, RPC_FALLBACK_URL].filter((url): url is string => Boolean(url)),
));

const checkRateLimit = createRateLimiter(60_000, 600);

const handler = createRpcProxyHandler({
  rpcUrls: RPC_URLS,
  backendUrl: process.env.MEDIALANE_API_URL ?? "",
  apiKey: process.env.MEDIALANE_API_KEY,
  checkRateLimit,
});

export async function POST(req: NextRequest) {
  return handler(req);
}
