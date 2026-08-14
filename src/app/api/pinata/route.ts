import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
