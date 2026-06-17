import { getDepositHistory } from "@/src/lib/credits";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }
  const deposits = await getDepositHistory(address);
  return NextResponse.json({ deposits });
}
