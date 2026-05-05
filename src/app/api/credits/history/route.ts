import { getDepositHistory } from "@/src/lib/credits";
import { withAuth } from "@/src/lib/with-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, session) => {
  const deposits = await getDepositHistory(session.address);
  return NextResponse.json({ deposits });
});
