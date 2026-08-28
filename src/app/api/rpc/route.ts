import { NextRequest } from "next/server";
import { createRpcProxyHandler } from "@medialane/sdk";
import { createRateLimiter } from "@/src/lib/rate-limit";

const checkRateLimit = createRateLimiter(60_000, 600);

const handler = createRpcProxyHandler({
  backendUrl: process.env.MEDIALANE_API_URL ?? "",
  apiKey: process.env.MEDIALANE_API_KEY,
  checkRateLimit,
});

export async function POST(req: NextRequest) {
  return handler(req);
}
