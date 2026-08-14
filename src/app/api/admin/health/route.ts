import { NextResponse } from "next/server";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
