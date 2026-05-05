import { pinata } from "@/src/services/config/server-config";
import { getSession } from "@/src/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await pinata.upload.public.createSignedURL({ expires: 30 });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("[pinata] signed URL error:", error);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
