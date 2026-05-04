import { NextRequest, NextResponse } from "next/server";
import { refreshSession, setSessionCookies, clearSessionCookies } from "@/src/lib/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("auth-refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const result = await refreshSession(refreshToken);
  if (!result) {
    const response = NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, result.token, result.refreshToken);
  return response;
}
