import { pinata } from "@/src/services/config/server-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = await pinata.upload.public.createSignedURL({ expires: 30 });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("[pinata] signed URL error:", error);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
