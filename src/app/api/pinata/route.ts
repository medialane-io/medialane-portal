import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns a short-lived Pinata signed upload URL via medialane-backend's
// metered Pinata path (POST /v1/metadata/upload-directory's sibling, GET
// /v1/metadata/signed-url — medialane-backend/src/api/routes/metadata.ts).
// This route used to hold its own PINATA_JWT and call Pinata directly,
// which meant every upload went completely unbilled — the same "no free
// endpoints" bug medialane-io and medialane-starknet already closed for
// their equivalent routes. Portal never gets a Pinata credential of its own.
export async function GET() {
  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "Image upload is not configured: MEDIALANE_API_URL/MEDIALANE_API_KEY are missing on the server." },
      { status: 503 },
    );
  }
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/metadata/signed-url?kind=image`, {
      method: "GET",
      headers: { "x-api-key": apiKey },
    });
    const data = (await res.json().catch(() => ({}))) as { data?: { url: string }; error?: string };
    if (!res.ok || !data.data) {
      throw new Error(data.error ?? `Backend returned ${res.status}`);
    }
    return NextResponse.json({ url: data.data.url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[pinata] signed URL error:", error);
    return NextResponse.json({ error: `Could not create an upload URL: ${message}` }, { status: 502 });
  }
}
