import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/session";

const ALLOWED_HOSTNAMES = new Set([
  "gateway.pinata.cloud",
  "ipfs.io",
  "dweb.link",
  "cloudflare-ipfs.com",
  "nftstorage.link",
]);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (!ALLOWED_HOSTNAMES.has(parsed.hostname)) {
    console.warn(`[proxy] blocked hostname: ${parsed.hostname}`);
    return new NextResponse("Hostname not allowed", { status: 403 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(parsed.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get("Content-Type") ?? "application/octet-stream";
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      return new NextResponse("Gateway Timeout", { status: 504 });
    }
    console.error("[proxy] fetch error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
