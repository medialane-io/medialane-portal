import { createAppGateway } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";
import { ALLOW } from "./allowlist";

const gateway = createAppGateway({
  appId: "MEDIALANE_PORTAL",
  backendUrl: MEDIALANE_BACKEND_URL,
  apiKey: process.env.MEDIALANE_API_KEY,
  allow: ALLOW,
  timeoutMs: 55_000,
});

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  return gateway(req, (await ctx.params).path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
