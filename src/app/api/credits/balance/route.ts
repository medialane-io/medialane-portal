import { getSession } from "@/src/lib/session";
import { getBalance } from "@/src/lib/credits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const balance = await getBalance(session.address);
  return NextResponse.json({ balance });
}
