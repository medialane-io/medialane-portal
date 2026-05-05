import { getBalance } from "@/src/lib/credits";
import { withAuth } from "@/src/lib/with-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_req, session) => {
  const balance = await getBalance(session.address);
  return NextResponse.json({ balance });
});
