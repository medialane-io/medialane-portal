import { NextResponse } from "next/server";

// DISABLED alongside the admin proxy (see [...path]/route.ts). The admin console
// is closed pending the signed-request auth rebuild.
export function GET() {
  return NextResponse.json(
    { error: "Admin console is temporarily disabled while its auth is rebuilt." },
    { status: 403 },
  );
}
