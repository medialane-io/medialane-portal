import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { consumeNonce, verifyStarknetSignature } from "@/src/lib/portal-siws";
import { createSession, setSessionCookie } from "@/src/lib/portal-session";
import { isAdminAddress } from "@/src/lib/admin-allowlist";
import { normalizeStarknetAddress } from "@/src/lib/starknet-address";

const bodySchema = z.object({
  address: z.string().min(3),
  nonce: z.string().min(1),
  signature: z.array(z.string()).min(1),
  chain: z.string().optional(),
});

// POST /api/auth/verify — verify the wallet signature, resolve its Account, and
// issue a session carrying the AccountID. No per-wallet backend key is stored.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const chain = parsed.data.chain ?? "STARKNET";
  if (chain !== "STARKNET") {
    // Other chains light up as their connectors + verify schemes land (07 §IV).
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  let address: string;
  try {
    address = normalizeStarknetAddress(parsed.data.address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (!(await consumeNonce(parsed.data.nonce, address))) {
    return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 });
  }

  const verified = await verifyStarknetSignature(address, parsed.data.nonce, parsed.data.signature);
  if (!verified.ok) {
    if (verified.reason === "not_deployed") {
      return NextResponse.json(
        { error: "Your wallet isn't deployed on Starknet yet — make one transaction first, then sign in." },
        { status: 400 },
      );
    }
    if (verified.reason === "rpc_error") {
      return NextResponse.json(
        { error: "Couldn't reach Starknet to verify your signature. Please try again in a moment." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  // Resolve (find-or-create) the Account for this wallet via the backend, using
  // the single portal service secret. Keyed on (chain, address) → AccountID.
  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;
  if (!apiUrl || !apiSecret) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  }
  const resolveRes = await fetch(`${apiUrl}/admin/accounts/resolve`, {
    method: "POST",
    headers: { "x-api-key": apiSecret, "Content-Type": "application/json" },
    body: JSON.stringify({ chain, address }),
  });
  const resolveJson = await resolveRes.json().catch(() => null);
  const accountId = resolveJson?.data?.accountId as string | undefined;
  if (!resolveRes.ok || !accountId) {
    return NextResponse.json({ error: "Could not resolve account" }, { status: 502 });
  }

  const token = await createSession({
    accountId,
    chain,
    address,
    is_admin: isAdminAddress(address),
  });

  const response = NextResponse.json({ data: { accountId, address, chain } });
  setSessionCookie(response, token);
  return response;
}
