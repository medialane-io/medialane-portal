import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/api/proxy/v1/[...path]/session-cookie";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export const runtime = "nodejs";

const BACKEND_URL = MEDIALANE_BACKEND_URL;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return NextResponse.json(null);

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/v1/users/me`, {
    headers: {
      "x-api-key": process.env.MEDIALANE_API_KEY ?? "",
      "x-app-id": "MEDIALANE_PORTAL",
      "x-account-session": session,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    const signedOut = NextResponse.json(null);
    signedOut.cookies.delete(SESSION_COOKIE_NAME);
    return signedOut;
  }
  if (!res.ok) return NextResponse.json({ error: "Session check failed" }, { status: 502 });
  return NextResponse.json(await res.json());
}
