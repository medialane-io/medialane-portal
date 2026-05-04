import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/src/lib/session-edge";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await verifyTokenEdge(token);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({ ok: true, address: session.address });
}
