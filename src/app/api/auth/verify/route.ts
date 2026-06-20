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

// POST /api/auth/verify — delegate signature verification to the backend's proven
// SIWS verify (the exact endpoint the dapp uses with Braavos), then resolve the
// AccountID and issue the portal session. The portal verifies nothing on-chain itself.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;
  if (!apiUrl || !apiSecret) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  let address: string;
  try {
    address = normalizeStarknetAddress(parsed.data.address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // 1) Verify the wallet signature via the backend's proven SIWS verify.
  const verifyRes = await fetch(`${apiUrl}/v1/auth/siws/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  // 2) Resolve (find-or-create) the AccountID for this wallet.
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

  // 3) Issue the portal session.
  const token = await createSession({ accountId, chain: "STARKNET", address, is_admin: isAdminAddress(address) });
  const response = NextResponse.json({ data: { accountId, address, chain: "STARKNET" } });
  setSessionCookie(response, token);
  return response;
}
