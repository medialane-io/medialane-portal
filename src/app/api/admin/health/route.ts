import { NextResponse } from "next/server";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

// Public backend health, surfaced for the admin dashboard. No secret, no auth:
// the backend's /health is public. (The old spoofable x-admin-address gate was
// removed with the signed-request rebuild — see [...path]/route.ts.)
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
