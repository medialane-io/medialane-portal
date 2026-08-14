import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ contract: string; tokenId: string }> }
) {
  const params = await context.params;
  const search = new URL(req.url).search;
  const res = await fetch(`${BACKEND_URL}/v1/tokens/${params.contract}/${params.tokenId}${search}`, {
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
