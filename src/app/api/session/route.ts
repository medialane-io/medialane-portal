import { createAppSessionHandler } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export const runtime = "nodejs";

const handler = createAppSessionHandler({
  appId: "MEDIALANE_PORTAL",
  backendUrl: MEDIALANE_BACKEND_URL,
  apiKey: process.env.MEDIALANE_API_KEY,
  appSecret: process.env.MEDIALANE_APP_SECRET,
});

export const GET = (req: Request) => handler.GET(req);
export const DELETE = (req: Request) => handler.DELETE(req);
