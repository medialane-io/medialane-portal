import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/src/lib/portal-session";

// POST /api/auth/signout — clear the session cookie.
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
