import { pinata } from "@/src/services/config/server-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Surface a clear, actionable reason instead of an opaque 500 — admins need
  // to know whether this is a missing env (config) or a Pinata API error.
  if (!process.env.PINATA_JWT) {
    return NextResponse.json(
      { error: "Image upload is not configured: PINATA_JWT is missing on the server." },
      { status: 503 },
    );
  }
  try {
    const url = await pinata.upload.public.createSignedURL({ expires: 60 });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[pinata] signed URL error:", error);
    return NextResponse.json({ error: `Could not create an upload URL: ${message}` }, { status: 502 });
  }
}
