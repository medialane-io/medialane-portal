import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

type AdminContext = { params: Promise<Record<string, string | string[]>> };
type AdminHandler = (
  req: NextRequest,
  session: SessionPayload,
  context?: AdminContext
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler) {
  return async (req: NextRequest, context?: AdminContext): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await pool.query<{ is_admin: boolean }>(
      "SELECT is_admin FROM accounts WHERE address = $1",
      [session.address]
    );
    if (!result.rows[0]?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, session, context);
  };
}
