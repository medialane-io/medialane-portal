import { NextRequest } from "next/server";
import { createRpcProxyHandler } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "@/lib/constants";

const handler = createRpcProxyHandler({
  backendUrl: MEDIALANE_BACKEND_URL,
  apiKey: MEDIALANE_API_KEY,
});

export async function POST(req: NextRequest) {
  return handler(req);
}
