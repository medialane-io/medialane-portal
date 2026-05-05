import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/src/lib/session";

type Context = { params: Promise<Record<string, string | string[]>> };
type AuthedHandler = (
  req: NextRequest,
  session: SessionPayload,
  context?: Context
) => Promise<NextResponse>;

export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, context?: Context): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, session, context);
  };
}
