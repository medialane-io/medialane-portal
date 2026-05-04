import { getSession } from "@/src/lib/session";
import { getDepositHistory } from "@/src/lib/credits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deposits = await getDepositHistory(session.address);
  return NextResponse.json({ deposits });
}
