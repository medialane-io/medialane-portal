import { NextResponse } from "next/server";

// The admin web proxy is DISABLED. It previously authorized on a spoofable,
// client-supplied `x-admin-address` header while attaching the backend master
// key — a full admin bypass (see spec 2026-06-22-portal-admin-signed-request-auth).
// It is being rebuilt on signed-request auth. Until then: closed. Operators use
// the backend API_SECRET_KEY via CLI.
function disabled() {
  return NextResponse.json(
    { error: "Admin console is temporarily disabled while its auth is rebuilt." },
    { status: 403 },
  );
}

export const GET = disabled;
export const POST = disabled;
export const PATCH = disabled;
export const DELETE = disabled;
