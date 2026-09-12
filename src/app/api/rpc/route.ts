import { NextRequest } from "next/server";
import { limiterFor } from "@/lib/rate-limit-policy";
import { createRpcProxyHandler } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "@/lib/constants";

const checkRateLimit = limiterFor("proxy:rpc");

const handler = createRpcProxyHandler({
  backendUrl: MEDIALANE_BACKEND_URL,
  apiKey: MEDIALANE_API_KEY,
  checkRateLimit,
});

export async function POST(req: NextRequest) {
  return handler(req);
}
