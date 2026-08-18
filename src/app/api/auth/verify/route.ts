import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, setSessionCookie } from "@/src/lib/portal-session";
import { isAdminAddress } from "@/src/lib/admin-allowlist";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

const bodySchema = z.object({
  address: z.string().min(3),
  nonce: z.string().min(1),
  signature: z.array(z.string()).min(1),
});

/** Every signed-in account gets developer access — find its ApiClient, provisioning one on first sign-in. */
async function resolveApiClientId(apiUrl: string, apiSecret: string, accountId: string): Promise<string | null> {
  const headers = { "x-api-key": apiSecret, "Content-Type": "application/json" };

  const lookup = await fetch(`${apiUrl}/admin/accounts?q=${encodeURIComponent(accountId)}`, { headers });
  const lookupJson = await lookup.json().catch(() => null);
  const existing = lookupJson?.data?.find((a: { id: string }) => a.id === accountId)?.apiClient?.id as
    | string
    | undefined;
  if (existing) return existing;

  const created = await fetch(`${apiUrl}/admin/api-clients`, {
    method: "POST",
    headers,
    body: JSON.stringify({ accountId }),
  });
  const createdJson = await created.json().catch(() => null);
  if (created.status === 201) return (createdJson?.data?.id as string | undefined) ?? null;
  if (created.status !== 409) return null;

  // Lost a create race — someone else provisioned it between our lookup and our create.
  const retry = await fetch(`${apiUrl}/admin/accounts?q=${encodeURIComponent(accountId)}`, { headers });
  const retryJson = await retry.json().catch(() => null);
  return (retryJson?.data?.find((a: { id: string }) => a.id === accountId)?.apiClient?.id as string | undefined) ?? null;
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;
  const apiKey = process.env.MEDIALANE_API_KEY;
  if (!apiUrl || !apiSecret || !apiKey) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  let address: string;
  try {
    address = normalizeStarknetAddress(parsed.data.address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const verifyRes = await fetch(`${apiUrl}/v1/auth/siws/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ walletAddress: address, nonce: parsed.data.nonce, signature: parsed.data.signature }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    if (err?.error === "account_not_deployed") {
      return NextResponse.json(
        { error: err.message ?? "Your wallet isn't deployed on Starknet yet — make one transaction first, then sign in." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const resolveRes = await fetch(`${apiUrl}/admin/accounts/resolve`, {
    method: "POST",
    headers: { "x-api-key": apiSecret, "Content-Type": "application/json" },
    body: JSON.stringify({ chain: "STARKNET", address }),
  });
  const resolveJson = await resolveRes.json().catch(() => null);
  const accountId = resolveJson?.data?.accountId as string | undefined;
  if (!resolveRes.ok || !accountId) {
    return NextResponse.json({ error: "Could not resolve account" }, { status: 502 });
  }

  const apiClientId = await resolveApiClientId(apiUrl, apiSecret, accountId);
  if (!apiClientId) {
    return NextResponse.json({ error: "Could not provision developer access for this account" }, { status: 502 });
  }

  const token = await createSession({ accountId, apiClientId, chain: "STARKNET", address, is_admin: isAdminAddress(address) });
  const response = NextResponse.json({ data: { accountId, address, chain: "STARKNET" } });
  setSessionCookie(response, token);
  return response;
}
