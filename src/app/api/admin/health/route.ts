import { NextRequest, NextResponse } from "next/server";
import { isAdminAddress } from "@/src/lib/admin-allowlist";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

export async function GET(req: NextRequest) {
  if (!isAdminAddress(req.headers.get("x-admin-address"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
