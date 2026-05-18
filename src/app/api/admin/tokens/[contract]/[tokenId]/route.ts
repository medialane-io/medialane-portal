import { withAdmin } from "@/src/lib/with-admin";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

// GET /api/admin/tokens/:contract/:tokenId
// Fetches from the public /v1/tokens endpoint — there is no admin-specific
// GET token endpoint on the backend. Admin gate is still enforced here.
export const GET = withAdmin(async (req: NextRequest, _, context) => {
  const params = await context?.params as { contract: string; tokenId: string };
  const url = new URL(req.url);
  const search = url.search; // forward any ?wait=true etc.
  const res = await fetch(`${BACKEND_URL}/v1/tokens/${params.contract}/${params.tokenId}${search}`, {
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
});
