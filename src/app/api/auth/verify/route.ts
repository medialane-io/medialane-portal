import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, setSessionCookie } from "@/src/lib/portal-session";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";
import { createRateLimiter, clientIp } from "@/src/lib/rate-limit";

const bodySchema = z.object({
  address: z.string().min(3),
  nonce: z.string().min(1),
  signature: z.array(z.string()).min(1),
});

const checkRateLimit = createRateLimiter(60_000, 20);

export async function POST(req: NextRequest) {
  if (!checkRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiUrl || !apiKey) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  let address: string;
  try {
    address = normalizeStarknetAddress(parsed.data.address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // Wallet signature is the only proof required — the backend self-provisions
  // this wallet's Account + ApiClient, no admin credential involved.
  const verifyRes = await fetch(`${apiUrl}/v1/auth/siws/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      walletAddress: address,
      nonce: parsed.data.nonce,
      signature: parsed.data.signature,
      appSource: "MEDIALANE_PORTAL",
    }),
  });
  const verifyJson = await verifyRes.json().catch(() => null) as
    | { token?: string; accountId?: string; apiClientId?: string; error?: string; message?: string }
    | null;
  if (!verifyRes.ok || !verifyJson?.token || !verifyJson.accountId || !verifyJson.apiClientId) {
    if (verifyJson?.error === "account_not_deployed") {
      return NextResponse.json(
        { error: verifyJson.message ?? "Your wallet isn't deployed on Starknet yet. Make one transaction first, then sign in." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }
  const { token, accountId, apiClientId } = verifyJson;

  // Mint a fresh session-scoped API key, proven only by the SIWS bearer token
  // we just earned by signing — still no shared/admin secret.
  const keyRes = await fetch(`${apiUrl}/v1/auth/siws/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, Authorization: `Bearer ${token}` },
  });
  const keyJson = await keyRes.json().catch(() => null) as { data?: { plaintext?: string } } | null;
  if (!keyRes.ok || !keyJson?.data?.plaintext) {
    return NextResponse.json({ error: "Could not provision developer access for this account" }, { status: 502 });
  }

  const sessionToken = await createSession({
    accountId,
    apiClientId,
    chain: "STARKNET",
    address,
    apiKey: keyJson.data.plaintext,
  });
  const response = NextResponse.json({ data: { accountId, address, chain: "STARKNET" } });
  setSessionCookie(response, sessionToken);
  return response;
}
