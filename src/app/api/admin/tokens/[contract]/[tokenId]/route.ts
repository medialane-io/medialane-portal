import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

// GET /api/admin/tokens/:contract/:tokenId — reads the PUBLIC /v1/tokens endpoint
// (there is no admin-specific GET token endpoint). No secret, no auth: token
// metadata is public. The privileged refresh (POST .../refresh) goes through the
// signed catch-all forwarder ([...path]/route.ts). The old spoofable
// x-admin-address gate was removed with the signed-request rebuild.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ contract: string; tokenId: string }> }
) {
  const params = await context.params;
  const search = new URL(req.url).search; // forward any ?wait=true etc.
  const res = await fetch(`${BACKEND_URL}/v1/tokens/${params.contract}/${params.tokenId}${search}`, {
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
