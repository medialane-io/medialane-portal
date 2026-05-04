import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, destroySession } from "@/src/lib/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("auth-refresh")?.value;
  if (refreshToken) {
    await destroySession(refreshToken);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
