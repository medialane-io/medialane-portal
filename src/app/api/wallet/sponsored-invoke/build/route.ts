import { NextRequest } from "next/server";
import { limiterFor } from "@/lib/rate-limit-policy";
import { createBackendProxyHandler } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "@/lib/constants";
import { SESSION_COOKIE_NAME } from "@/app/api/proxy/v1/[...path]/session-cookie";

export const runtime = "nodejs";

const handler = createBackendProxyHandler({
  path: "/v1/paymaster/invoke/build",
  backendUrl: MEDIALANE_BACKEND_URL,
  apiKey: MEDIALANE_API_KEY,
  checkRateLimit: limiterFor("wallet:invoke-build"),
  forwardCookie: { name: SESSION_COOKIE_NAME, header: "x-account-session" },
});

export async function POST(req: NextRequest) {
  return handler(req);
}
