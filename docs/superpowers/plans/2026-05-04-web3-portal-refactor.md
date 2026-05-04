# Web3 Portal Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace email/password auth and ChipiPay with SIWS wallet authentication, on-chain USDC credit deposits, and MDLN tier multipliers — enabling permissionless access for humans and AI agents alike.

**Architecture:** Identity is a Starknet wallet address. Users sign a typed-data challenge to receive a short-lived JWT (httpOnly cookie); API keys are tied to `wallet_address`. Credits are purchased via on-chain USDC deposits detected by a Vercel cron poller and stored in PostgreSQL. MDLN balance is read on-chain at deposit time to apply a credit multiplier.

**Tech Stack:** Next.js 15 App Router, `@starknet-react/core` v3 (already installed), `starknet` v6 (add), `jose` v5 (add, JWT), `starkzap` (add if published), PostgreSQL via `pg`.

**Note:** No test runner is configured. Verification after each task uses `~/.bun/bin/bun run build` (must pass 0 errors) plus manual steps where noted. TypeScript errors are treated as failures.

**Design spec:** `docs/superpowers/specs/2026-05-04-web3-portal-refactor-design.md`

---

## File Map

### Created
| File | Purpose |
|---|---|
| `src/lib/siws.ts` | Nonce generation + Starknet typed-data signature verification |
| `src/lib/session.ts` | JWT create / verify / refresh / destroy via `jose` |
| `src/lib/credits.ts` | Credit balance CRUD in PostgreSQL |
| `src/lib/mdln.ts` | On-chain MDLN ERC-20 `balanceOf` read |
| `src/app/api/auth/challenge/route.ts` | GET — generate nonce for an address |
| `src/app/api/auth/verify/route.ts` | POST — verify signature, issue JWT + refresh token |
| `src/app/api/auth/signout/route.ts` | POST — clear cookies, invalidate refresh token |
| `src/app/api/auth/refresh/route.ts` | POST — silently rotate JWT |
| `src/app/api/credits/poll/route.ts` | GET (Vercel cron) — detect USDC deposits, credit accounts |
| `src/components/wallet-connect.tsx` | "Connect Wallet" button + SIWS flow (client component) |
| `src/components/portal/credits-tab.tsx` | Credits dashboard tab (balance, top-up, MDLN tier) |

### Modified
| File | Change |
|---|---|
| `package.json` | Add `starknet`, `jose`; remove `better-auth`, `@better-fetch/fetch`, `@chipi-stack/*` |
| `src/middleware.tsx` | Replace Better Auth session check with `jose` JWT cookie verify |
| `src/app/layout.tsx` | Remove ChipiPay provider wrapper |
| `src/app/starknet-provider-wrapper.tsx` | Add StarkZap provider if published |
| `src/app/sign-in/page.tsx` | Replace email form with `<WalletConnect />` |
| `src/app/account/page.tsx` | Replace `auth.api.getSession()` with `getSession()` from `src/lib/session.ts` |
| `src/app/account/dashboard.tsx` | Remove ChipiPay hooks; accept `address` prop; show Credits tab |
| `src/app/api/portal/[...path]/route.ts` | Replace Better Auth session with `getSession()` |
| `src/app/api/portal/provision/route.ts` | Replace Better Auth session + user table with wallets table |
| `src/lib/portal/provision.ts` | Use `wallet_address` as identifier instead of `userId`/`email` |
| `src/components/portal/plan-tab.tsx` | Delete (replaced by credits-tab) |
| `src/components/account-button.tsx` | Show truncated wallet address when connected |
| `src/app/page.tsx` | Homepage content: agent-native CTA, updated pricing cards |
| `src/app/pricing/page.tsx` | Credit model: $0.01/credit, MDLN tier table |
| `src/app/docs/page.tsx` | Getting started: wallet connect as entry point |

### Deleted
```
src/lib/auth.ts
src/lib/auth-client.ts
src/app/sign-up/page.tsx
src/app/onboarding/ (entire directory)
src/components/chipi/ (entire directory)
src/components/auth/wallet-guard.tsx
src/components/debug/chipi-debug.tsx
src/components/debug/chipi-debugger.tsx
src/app/api/auth/[...all]/route.ts
```

---

## Task 1: Dependency Cleanup

**Files:**
- Modify: `package.json`

Remove broken packages and install the new ones. Then delete all dead files.

- [ ] **Step 1: Update package.json**

```bash
cd /Users/kalamaha/dev/medialane-portal
~/.bun/bin/bun remove better-auth @better-fetch/fetch @chipi-stack/nextjs
~/.bun/bin/bun add starknet@^6.0.0 jose@^5.0.0
```

- [ ] **Step 2: Check if starkzap is published**

```bash
~/.bun/bin/bun info starkzap 2>/dev/null && echo "PUBLISHED" || echo "NOT PUBLISHED"
```

If `PUBLISHED`: run `~/.bun/bin/bun add starkzap`.
If `NOT PUBLISHED`: skip — we use `starknet.js` directly for balance reads and `starknet-react` for transfers. Note this in a comment in `src/lib/mdln.ts`.

- [ ] **Step 3: Delete dead files**

```bash
rm -f src/lib/auth.ts src/lib/auth-client.ts
rm -f src/app/sign-up/page.tsx
rm -rf src/app/onboarding
rm -rf src/components/chipi
rm -f src/components/auth/wallet-guard.tsx
rm -f src/components/debug/chipi-debug.tsx
rm -f src/components/debug/chipi-debugger.tsx
rm -f src/app/api/auth/[...all]/route.ts
rm -f src/components/portal/plan-tab.tsx
```

- [ ] **Step 4: Verify build (expect errors — document them)**

```bash
~/.bun/bin/bun run build 2>&1 | head -60
```

Expected: build fails with import errors referencing the deleted files. Note which files still import from `auth.ts` or `auth-client.ts` — these are the files you'll fix in subsequent tasks. Do not fix them now.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Better Auth, ChipiPay; add starknet + jose"
```

---

## Task 2: Database Schema Migration

**Files:**
- Create: `src/lib/migrate.ts` (one-shot migration runner, deleted after use)
- Modify: `src/lib/db.ts`

Add the new tables. The old Better Auth tables (`user`, `session`, `account`, `verification`) are left in place — they're harmless and avoid the risk of accidental data loss. The new tables are additive.

- [ ] **Step 1: Create the migration file**

Create `src/lib/migrate.ts`:

```typescript
import { pool } from "./db";

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        address     TEXT PRIMARY KEY,
        mdln_tier   INT NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS credits (
        address     TEXT PRIMARY KEY REFERENCES wallets(address),
        balance     INT NOT NULL DEFAULT 0,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address      TEXT NOT NULL REFERENCES wallets(address),
        usdc_amount  INT NOT NULL,
        tx_hash      TEXT UNIQUE NOT NULL,
        multiplier   NUMERIC(4,2) NOT NULL,
        credited     INT NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS nonces (
        nonce       TEXT PRIMARY KEY,
        address     TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address      TEXT NOT NULL REFERENCES wallets(address),
        token_hash   TEXT NOT NULL,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query("CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions(address)");

    // Add wallet_address column to the backend_api_keys store
    // (provision.ts will now key by wallet address instead of user id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_provisioning (
        address          TEXT PRIMARY KEY REFERENCES wallets(address),
        backend_api_key  TEXT,
        backend_tenant_id TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query("COMMIT");
    console.log("Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run the migration**

```bash
~/.bun/bin/bun run src/lib/migrate.ts
```

Expected output: `Migration complete`

- [ ] **Step 3: Delete the migration file**

```bash
rm src/lib/migrate.ts
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add wallet auth and credit schema tables"
```

---

## Task 3: SIWS Library

**Files:**
- Create: `src/lib/siws.ts`

Nonce generation, typed-data message construction, and Starknet signature verification via RPC call to `is_valid_signature` on the wallet contract.

- [ ] **Step 1: Create `src/lib/siws.ts`**

```typescript
import { randomBytes } from "crypto";
import { RpcProvider, typedData as sdkTypedData, num } from "starknet";
import { pool } from "./db";

const DOMAIN = {
  name: "Medialane Portal",
  version: "1",
  chainId: "SN_MAIN",
  revision: "1",
} as const;

const TYPES = {
  StarknetDomain: [
    { name: "name", type: "shortstring" },
    { name: "version", type: "shortstring" },
    { name: "chainId", type: "shortstring" },
    { name: "revision", type: "shortstring" },
  ],
  SignIn: [
    { name: "nonce", type: "shortstring" },
    { name: "address", type: "felt" },
  ],
} as const;

export function buildTypedData(nonce: string, address: string) {
  return {
    types: TYPES,
    primaryType: "SignIn",
    domain: DOMAIN,
    message: { nonce, address },
  };
}

export async function generateNonce(address: string): Promise<string> {
  // Clean up expired nonces first
  await pool.query("DELETE FROM nonces WHERE expires_at < now()");

  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await pool.query(
    "INSERT INTO nonces (nonce, address, expires_at) VALUES ($1, $2, $3)",
    [nonce, address.toLowerCase(), expiresAt]
  );

  return nonce;
}

export async function consumeNonce(
  nonce: string,
  address: string
): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM nonces WHERE nonce = $1 AND address = $2 AND expires_at > now() RETURNING nonce",
    [nonce, address.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}

// VALID_SIGNATURE magic bytes returned by Argent X account contracts
const FELT_VALID = "0x56414c4944";

export async function verifySignature(
  address: string,
  nonce: string,
  signature: string[]
): Promise<boolean> {
  const rpcUrl = process.env.STARKNET_RPC_URL;
  if (!rpcUrl) throw new Error("STARKNET_RPC_URL is not set");

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const typedDataPayload = buildTypedData(nonce, address);
  const msgHash = sdkTypedData.getMessageHash(typedDataPayload, address);

  try {
    const result = await provider.callContract({
      contractAddress: address,
      entrypoint: "is_valid_signature",
      calldata: [
        msgHash,
        signature.length.toString(),
        ...signature,
      ],
    });
    // Argent X returns FELT_VALID; Braavos returns '0x1'
    return result[0] === FELT_VALID || result[0] === "0x1";
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Verify types compile**

```bash
~/.bun/bin/bun run build 2>&1 | grep "siws" || echo "No siws errors"
```

Expected: no errors mentioning `siws.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/siws.ts
git commit -m "feat: add SIWS library (nonce generation + Starknet signature verification)"
```

---

## Task 4: Session Library

**Files:**
- Create: `src/lib/session.ts`

JWT create/verify/refresh using `jose`. Also handles the refresh token stored in the `sessions` table.

- [ ] **Step 1: Create `src/lib/session.ts`**

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { pool } from "./db";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
};

const AUTH_TOKEN_COOKIE = "auth-token";
const REFRESH_TOKEN_COOKIE = "auth-refresh";
const TOKEN_TTL = "15m";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(payload: SessionPayload): Promise<{
  token: string;
  refreshToken: string;
}> {
  const secret = getSecret();

  const token = await new SignJWT({
    sub: payload.address,
    mdln_tier: payload.mdln_tier,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret);

  const refreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await pool.query(
    "INSERT INTO sessions (address, token_hash, expires_at) VALUES ($1, $2, $3)",
    [payload.address.toLowerCase(), hashToken(refreshToken), expiresAt]
  );

  return { token, refreshToken };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      address: payload.sub as string,
      mdln_tier: payload.mdln_tier as number,
    };
  } catch {
    return null;
  }
}

export async function refreshSession(
  refreshToken: string
): Promise<{ token: string; refreshToken: string } | null> {
  const hash = hashToken(refreshToken);
  const result = await pool.query<{ address: string; id: string }>(
    "DELETE FROM sessions WHERE token_hash = $1 AND expires_at > now() RETURNING address, id",
    [hash]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  const { address } = result.rows[0];

  // Re-read mdln_tier from wallets table for fresh data
  const wallet = await pool.query<{ mdln_tier: number }>(
    "SELECT mdln_tier FROM wallets WHERE address = $1",
    [address]
  );
  const mdln_tier = wallet.rows[0]?.mdln_tier ?? 0;

  return createSession({ address, mdln_tier });
}

export async function destroySession(refreshToken: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [
    hashToken(refreshToken),
  ]);
}

export function setSessionCookies(
  response: Response,
  token: string,
  refreshToken: string
) {
  const secure = process.env.NODE_ENV === "production";
  const base = `; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=900${base}`);
  response.headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE}=${refreshToken}; Max-Age=${REFRESH_TTL_MS / 1000}${base}`
  );
}

export function clearSessionCookies(response: Response) {
  const base = "; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
  response.headers.append("Set-Cookie", `${AUTH_TOKEN_COOKIE}=${base}`);
  response.headers.append("Set-Cookie", `${REFRESH_TOKEN_COOKIE}=${base}`);
}

// Edge-compatible verify (for middleware — does not use cookies() or DB)
export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      address: payload.sub as string,
      mdln_tier: payload.mdln_tier as number,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify types compile**

```bash
~/.bun/bin/bun run build 2>&1 | grep "session" || echo "No session errors"
```

Expected: no errors in `session.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: add session library (JWT create/verify/refresh via jose)"
```

---

## Task 5: Auth API Routes

**Files:**
- Create: `src/app/api/auth/challenge/route.ts`
- Create: `src/app/api/auth/verify/route.ts`
- Create: `src/app/api/auth/signout/route.ts`
- Create: `src/app/api/auth/refresh/route.ts`

Note: delete the old catch-all `src/app/api/auth/[...all]/route.ts` if it still exists (was done in Task 1).

- [ ] **Step 1: Create `src/app/api/auth/challenge/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateNonce, buildTypedData } from "@/src/lib/siws";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
  }

  const nonce = await generateNonce(address);
  const typedData = buildTypedData(nonce, address);

  return NextResponse.json({ nonce, typedData });
}
```

- [ ] **Step 2: Create `src/app/api/auth/verify/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { consumeNonce, verifySignature } from "@/src/lib/siws";
import { createSession, setSessionCookies } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { address, nonce, signature } = body ?? {};

  if (
    typeof address !== "string" ||
    typeof nonce !== "string" ||
    !Array.isArray(signature)
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const normalizedAddress = address.toLowerCase();

  const nonceValid = await consumeNonce(nonce, normalizedAddress);
  if (!nonceValid) {
    return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
  }

  const sigValid = await verifySignature(normalizedAddress, nonce, signature);
  if (!sigValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Upsert wallet (creates account on first sign-in)
  await pool.query(
    `INSERT INTO wallets (address) VALUES ($1)
     ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );
  // Ensure credits row exists
  await pool.query(
    `INSERT INTO credits (address) VALUES ($1)
     ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );

  const wallet = await pool.query<{ mdln_tier: number }>(
    "SELECT mdln_tier FROM wallets WHERE address = $1",
    [normalizedAddress]
  );
  const mdln_tier = wallet.rows[0]?.mdln_tier ?? 0;

  const { token, refreshToken } = await createSession({ address: normalizedAddress, mdln_tier });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookies(response, token, refreshToken);
  return response;
}
```

- [ ] **Step 3: Create `src/app/api/auth/signout/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies, destroySession } from "@/src/lib/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("auth-refresh")?.value;
  if (refreshToken) {
    await destroySession(refreshToken);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
```

- [ ] **Step 4: Create `src/app/api/auth/refresh/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { refreshSession, setSessionCookies, clearSessionCookies } from "@/src/lib/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("auth-refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const result = await refreshSession(refreshToken);
  if (!result) {
    const response = NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, result.token, result.refreshToken);
  return response;
}
```

- [ ] **Step 5: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "auth/challenge|auth/verify|auth/signout|auth/refresh" || echo "Auth routes OK"
```

Expected: no errors in the new auth route files.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat: add SIWS auth routes (challenge, verify, signout, refresh)"
```

---

## Task 6: Middleware

**Files:**
- Modify: `src/middleware.tsx`

Replace the Better Auth `betterFetch` session check with a direct JWT cookie verify using `jose` (Edge-compatible).

- [ ] **Step 1: Rewrite `src/middleware.tsx`**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/src/lib/session";

const PROTECTED = ["/account", "/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const session = await verifyTokenEdge(token);
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
```

Note: `/onboarding` is removed from the matcher because that route will be deleted.

- [ ] **Step 2: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep "middleware" || echo "Middleware OK"
```

Expected: no errors in `middleware.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.tsx
git commit -m "feat: replace Better Auth middleware with JWT cookie verify (Edge-compatible)"
```

---

## Task 7: Portal API Routes — Auth Update

**Files:**
- Modify: `src/app/api/portal/[...path]/route.ts`
- Modify: `src/app/api/portal/provision/route.ts`
- Modify: `src/lib/portal/provision.ts`

Replace `auth.api.getSession()` with `getSession()` from `src/lib/session.ts`. Change identity from `userId/email` to `wallet_address`.

- [ ] **Step 1: Rewrite `src/app/api/portal/[...path]/route.ts`**

```typescript
import { pool } from "@/src/lib/db";
import { getSession } from "@/src/lib/session";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM wallet_provisioning WHERE address = $1",
    [session.address]
  );

  const apiKey = row.rows[0]?.backend_api_key;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key — provision first" },
      { status: 403 }
    );
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  }

  const { path } = await params;
  const subpath = path.join("/");
  const search = req.nextUrl.search;
  const upstreamUrl = `${apiUrl}/v1/portal/${subpath}${search}`;

  const reqHeaders: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: reqHeaders,
    body,
  });

  const json = await upstream.json().catch(() => null);
  return NextResponse.json(json ?? {}, { status: upstream.status });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
```

- [ ] **Step 2: Rewrite `src/app/api/portal/provision/route.ts`**

```typescript
import { getSession } from "@/src/lib/session";
import { provisionWallet } from "@/src/lib/portal/provision";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await provisionWallet({ address: session.address });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    alreadyProvisioned: result.alreadyProvisioned ?? false,
  });
}
```

- [ ] **Step 3: Rewrite `src/lib/portal/provision.ts`**

```typescript
import { pool } from "@/src/lib/db";

interface ProvisionInput {
  address: string;
}

interface ProvisionResult {
  ok: boolean;
  alreadyProvisioned?: boolean;
  error?: string;
}

export async function provisionWallet(input: ProvisionInput): Promise<ProvisionResult> {
  const existing = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM wallet_provisioning WHERE address = $1",
    [input.address]
  );

  if (existing.rows[0]?.backend_api_key) {
    return { ok: true, alreadyProvisioned: true };
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;

  if (!apiUrl || !apiSecret) {
    return { ok: false, error: "Backend not configured" };
  }

  const res = await fetch(`${apiUrl}/admin/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiSecret,
    },
    body: JSON.stringify({ name: input.address, email: `${input.address}@wallet.medialane.io`, plan: "FREE" }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[provision] Backend error:", res.status, body);
    return { ok: false, error: "Failed to provision tenant" };
  }

  const json = await res.json();
  const { tenant, apiKey } = json?.data ?? {};
  const plaintext = apiKey?.plaintext;
  const tenantId = tenant?.id;

  if (!plaintext || !tenantId) {
    console.error("[provision] Unexpected backend response:", json);
    return { ok: false, error: "Invalid backend response" };
  }

  await pool.query(
    `INSERT INTO wallet_provisioning (address, backend_api_key, backend_tenant_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (address) DO UPDATE SET backend_api_key = $2, backend_tenant_id = $3`,
    [input.address, plaintext, tenantId]
  );

  return { ok: true };
}
```

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "portal|provision" | head -20 || echo "Portal routes OK"
```

Expected: no errors in the portal route files.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/portal/ src/lib/portal/provision.ts
git commit -m "feat: update portal API routes to use wallet address identity"
```

---

## Task 8: Sign-in Page + WalletConnect Component

**Files:**
- Create: `src/components/wallet-connect.tsx`
- Modify: `src/app/sign-in/page.tsx`

The sign-in page becomes a single "Connect Wallet" button that runs the SIWS flow.

- [ ] **Step 1: Create `src/components/wallet-connect.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { buildTypedData } from "@/src/lib/siws";
import { useRouter } from "next/navigation";

export function WalletConnect({ redirectTo = "/account" }: { redirectTo?: string }) {
  const { address, account, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!address || !account) return;
    setSigning(true);
    setError(null);

    try {
      // 1. Get challenge
      const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
      const { nonce, typedData } = await challengeRes.json();

      // 2. Sign typed data with wallet
      const signature = await account.signMessage(typedData);
      const sigArray = Array.isArray(signature)
        ? signature.map((s) => s.toString())
        : [signature.r.toString(), signature.s.toString()];

      // 3. Verify and get session
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, nonce, signature: sigArray }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "Verification failed");
      }

      // 4. Provision backend tenant (idempotent)
      await fetch("/api/portal/provision", { method: "POST" });

      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigning(false);
    }
  }

  // Not connected — show connector buttons
  if (status === "disconnected") {
    return (
      <div className="space-y-3">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 justify-start gap-3"
            onClick={() => connect({ connector })}
          >
            <Wallet className="w-4 h-4" />
            Connect {connector.name}
          </Button>
        ))}
      </div>
    );
  }

  // Connected — show sign-in button
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center truncate">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </p>
      <Button
        className="w-full"
        onClick={handleSignIn}
        disabled={signing}
      >
        {signing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</>
        ) : (
          <><Wallet className="w-4 h-4 mr-2" /> Sign in to Medialane</>
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground"
        onClick={() => disconnect()}
      >
        Use a different wallet
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/sign-in/page.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { WalletConnect } from "@/src/components/wallet-connect";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Connect Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your Starknet wallet is your account. No email or password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletConnect />
        </CardContent>
      </Card>
    </div>
  );
}
```

Note: the `WalletConnect` component is `"use client"` and the sign-in page is a server component — this is correct per the CLAUDE.md pattern.

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "sign-in|wallet-connect" | head -20 || echo "Sign-in OK"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/wallet-connect.tsx src/app/sign-in/page.tsx
git commit -m "feat: replace email sign-in with wallet connect + SIWS flow"
```

---

## Task 9: Account Page + Dashboard

**Files:**
- Modify: `src/app/account/page.tsx`
- Modify: `src/app/account/dashboard.tsx`

Replace Better Auth session with `getSession()`. Remove ChipiPay `useGetWallet` hook. Pass `address` instead of `userId`/`publicKey`.

- [ ] **Step 1: Rewrite `src/app/account/page.tsx`**

```tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { AccountDashboard } from "./dashboard";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <AccountDashboard address={session.address} mdln_tier={session.mdln_tier} />;
}
```

- [ ] **Step 2: Rewrite `src/app/account/dashboard.tsx`**

Replace the entire file. Key changes: remove `useGetWallet`, remove ChipiPay imports, change tabs (Wallet → Credits, remove Plan tab), accept `address` + `mdln_tier` props.

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ApiKeysTab } from "@/src/components/portal/api-keys-tab";
import { UsageTab } from "@/src/components/portal/usage-tab";
import { WebhooksTab } from "@/src/components/portal/webhooks-tab";
import { CreditsTab } from "@/src/components/portal/credits-tab";
import { Key, BarChart2, Webhook, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

const MDLN_TIER_LABELS = ["No MDLN", "500+ MDLN", "2K+ MDLN", "5K+ MDLN"];
const MDLN_TIER_MULTIPLIERS = ["1.0x", "1.2x", "1.5x", "2.0x"];

interface Props {
  address: string;
  mdln_tier: number;
}

export function AccountDashboard({ address, mdln_tier }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl pt-28 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg font-mono font-bold truncate text-white">
                  {address.slice(0, 8)}…{address.slice(-6)}
                </h1>
                {mdln_tier > 0 && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {MDLN_TIER_LABELS[mdln_tier]} · {MDLN_TIER_MULTIPLIERS[mdln_tier]} credits
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Starknet Wallet</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">API Portal</p>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="w-full h-auto p-1 gap-1 bg-black/40 border border-white/10 rounded-xl grid grid-cols-4">
            <TabsTrigger value="keys" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Usage</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Webhook className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys"><ApiKeysTab /></TabsContent>
          <TabsContent value="credits"><CreditsTab address={address} mdln_tier={mdln_tier} /></TabsContent>
          <TabsContent value="usage"><UsageTab /></TabsContent>
          <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "account|dashboard" | head -20 || echo "Account OK"
```

Note: build will still fail on `CreditsTab` (not yet created) and missing `auth-client` imports. These are resolved in Tasks 10 and 11.

- [ ] **Step 4: Commit**

```bash
git add src/app/account/
git commit -m "feat: update account page and dashboard for wallet identity"
```

---

## Task 10: Credits Library + MDLN Reader

**Files:**
- Create: `src/lib/credits.ts`
- Create: `src/lib/mdln.ts`

- [ ] **Step 1: Create `src/lib/credits.ts`**

```typescript
import { pool } from "./db";

export type CreditBalance = {
  balance: number;
  free_used: number; // how many free credits used this month (not stored, computed on read)
};

export async function getBalance(address: string): Promise<number> {
  const result = await pool.query<{ balance: number }>(
    "SELECT balance FROM credits WHERE address = $1",
    [address.toLowerCase()]
  );
  return result.rows[0]?.balance ?? 0;
}

export async function addCredits(address: string, amount: number): Promise<void> {
  await pool.query(
    `UPDATE credits SET balance = balance + $2, updated_at = now() WHERE address = $1`,
    [address.toLowerCase(), amount]
  );
}

export async function deductCredit(address: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE credits SET balance = balance - 1, updated_at = now()
     WHERE address = $1 AND balance > 0
     RETURNING balance`,
    [address.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getDepositHistory(address: string) {
  const result = await pool.query(
    `SELECT id, usdc_amount, tx_hash, multiplier, credited, created_at
     FROM deposits WHERE address = $1 ORDER BY created_at DESC LIMIT 20`,
    [address.toLowerCase()]
  );
  return result.rows;
}
```

- [ ] **Step 2: Create `src/lib/mdln.ts`**

The MDLN contract address on Starknet needs to be confirmed from the medialane-contracts repo. In the meantime, the address is read from `NEXT_PUBLIC_MDLN_CONTRACT_ADDRESS` env var so it can be set without a code change.

```typescript
import { RpcProvider, Contract, uint256 } from "starknet";

// ERC-20 ABI — only balanceOf needed
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view",
  },
] as const;

export type MdlnTier = 0 | 1 | 2 | 3;

export function getTier(balance: bigint): MdlnTier {
  if (balance >= 5000n * 10n ** 18n) return 3;
  if (balance >= 2000n * 10n ** 18n) return 2;
  if (balance >= 500n * 10n ** 18n) return 1;
  return 0;
}

export function getMultiplier(tier: MdlnTier): number {
  return [1.0, 1.2, 1.5, 2.0][tier];
}

export async function getMdlnBalance(walletAddress: string): Promise<bigint> {
  const contractAddress = process.env.MDLN_CONTRACT_ADDRESS;
  const rpcUrl = process.env.STARKNET_RPC_URL;

  if (!contractAddress || !rpcUrl) return 0n;

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const contract = new Contract(ERC20_ABI, contractAddress, provider);

  try {
    const result = await contract.balanceOf(walletAddress);
    return uint256.uint256ToBN(result.balance);
  } catch {
    return 0n;
  }
}
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "credits|mdln" | head -20 || echo "Credits + MDLN libs OK"
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/credits.ts src/lib/mdln.ts
git commit -m "feat: add credits library and on-chain MDLN balance reader"
```

---

## Task 11: Credits Tab Component

**Files:**
- Create: `src/components/portal/credits-tab.tsx`

The Credits tab replaces both the old Wallet tab and Plan tab. Shows balance, MDLN tier badge, deposit history, and "Add Credits" button that initiates a USDC transfer via starknet-react.

- [ ] **Step 1: Create `src/components/portal/credits-tab.tsx`**

```tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Coins, Zap, ExternalLink, Loader2 } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "";
const MDLN_TIER_LABELS = ["No MDLN bonus", "500+ MDLN · 1.2x", "2,000+ MDLN · 1.5x", "5,000+ MDLN · 2.0x"];

interface Props {
  address: string;
  mdln_tier: number;
}

export function CreditsTab({ address, mdln_tier }: Props) {
  const { account } = useAccount();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  const { data: balanceData, mutate } = useSWR<{ balance: number }>(
    "/api/credits/balance",
    portalFetcher
  );

  const { data: historyData } = useSWR<{ deposits: Array<{ id: string; usdc_amount: number; credited: number; multiplier: string; tx_hash: string; created_at: string }> }>(
    "/api/credits/history",
    portalFetcher
  );

  async function handleDeposit() {
    if (!account || !TREASURY_ADDRESS) return;
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) return;

    setDepositing(true);
    setDepositError(null);
    setTxHash(null);

    try {
      // USDC has 6 decimals on Starknet
      const amount = BigInt(Math.round(usdc * 1_000_000));
      const result = await account.execute([
        {
          contractAddress: USDC_CONTRACT,
          entrypoint: "transfer",
          calldata: [TREASURY_ADDRESS, amount.toString(), "0"],
        },
      ]);
      setTxHash(result.transaction_hash);
      setUsdcAmount("");
      // Credits will appear after the cron poll (~2 min)
      setTimeout(() => mutate(), 5000);
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setDepositing(false);
    }
  }

  const balance = balanceData?.balance ?? 0;
  const CREDITS_PER_USDC = 100;
  const multiplier = [1.0, 1.2, 1.5, 2.0][mdln_tier];
  const previewCredits = usdcAmount
    ? Math.floor(parseFloat(usdcAmount) * CREDITS_PER_USDC * multiplier)
    : null;

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                API Credits
              </CardTitle>
              <CardDescription>1 credit = 1 API request · 1 USDC = 100 credits</CardDescription>
            </div>
            {mdln_tier > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {MDLN_TIER_LABELS[mdln_tier]}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="text-3xl font-bold text-foreground">{balance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">credits remaining</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Free Allowance</p>
              <p className="text-3xl font-bold text-foreground">50</p>
              <p className="text-xs text-muted-foreground">credits / month · resets 1st</p>
            </div>
          </div>

          {/* Top-up form */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Credits (USDC)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button onClick={handleDeposit} disabled={depositing || !account || !usdcAmount}>
                {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
              </Button>
            </div>
            {previewCredits !== null && !isNaN(previewCredits) && (
              <p className="text-xs text-muted-foreground">
                You'll receive <span className="text-primary font-semibold">{previewCredits.toLocaleString()} credits</span>
                {mdln_tier > 0 && ` (${multiplier}x MDLN bonus applied)`}
              </p>
            )}
            {depositError && <p className="text-sm text-destructive">{depositError}</p>}
            {txHash && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Transaction submitted — credits appear within ~2 min.{" "}
                <a
                  href={`https://starkscan.co/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
            {!account && (
              <p className="text-xs text-muted-foreground">Connect your wallet to deposit credits.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deposit history */}
      {historyData?.deposits && historyData.deposits.length > 0 && (
        <Card className="border-white/10 bg-background/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historyData.deposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-white">+{d.credited.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground">
                      ${(d.usdc_amount / 100).toFixed(2)} USDC · {d.multiplier}x
                    </p>
                  </div>
                  <a
                    href={`https://starkscan.co/tx/${d.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                  >
                    {new Date(d.created_at).toLocaleDateString()}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add credits API routes for the tab**

Create `src/app/api/credits/balance/route.ts`:

```typescript
import { getSession } from "@/src/lib/session";
import { getBalance } from "@/src/lib/credits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const balance = await getBalance(session.address);
  return NextResponse.json({ balance });
}
```

Create `src/app/api/credits/history/route.ts`:

```typescript
import { getSession } from "@/src/lib/session";
import { getDepositHistory } from "@/src/lib/credits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deposits = await getDepositHistory(session.address);
  return NextResponse.json({ deposits });
}
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "credits-tab|credits/balance|credits/history" | head -20 || echo "Credits tab OK"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/portal/credits-tab.tsx src/app/api/credits/
git commit -m "feat: add Credits tab with USDC deposit flow and balance display"
```

---

## Task 12: Deposit Poller (Vercel Cron)

**Files:**
- Create: `src/app/api/credits/poll/route.ts`
- Modify: `vercel.json` (create if missing)

The poller reads incoming USDC transfers to the treasury address since the last poll, credits matching wallet accounts, and records deposits to prevent double-crediting.

- [ ] **Step 1: Create `src/app/api/credits/poll/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { RpcProvider, Contract } from "starknet";
import { pool } from "@/src/lib/db";
import { getMdlnBalance, getTier, getMultiplier } from "@/src/lib/mdln";
import { addCredits } from "@/src/lib/credits";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const USDC_TRANSFER_ABI = [
  {
    name: "Transfer",
    type: "event",
    keys: [{ name: "from", type: "felt" }],
    data: [
      { name: "to", type: "felt" },
      { name: "value", type: "Uint256" },
    ],
  },
] as const;

export async function GET(req: NextRequest) {
  // Protect the route — only callable by Vercel cron or internal secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rpcUrl = process.env.STARKNET_RPC_URL;
  const treasury = process.env.TREASURY_ADDRESS;

  if (!rpcUrl || !treasury) {
    return NextResponse.json({ error: "STARKNET_RPC_URL or TREASURY_ADDRESS not set" }, { status: 500 });
  }

  const provider = new RpcProvider({ nodeUrl: rpcUrl });

  // Get latest block
  const latestBlock = await provider.getBlockNumber();

  // Read last polled block from DB (simple key-value using a meta table approach)
  const meta = await pool.query<{ last_block: number }>(
    "SELECT value::int AS last_block FROM poll_meta WHERE key = 'last_usdc_block'"
  ).catch(() => ({ rows: [] as { last_block: number }[] }));

  const fromBlock = meta.rows[0]?.last_block ?? Math.max(0, latestBlock - 100);
  const toBlock = latestBlock;

  if (fromBlock >= toBlock) {
    return NextResponse.json({ ok: true, message: "No new blocks" });
  }

  // Fetch Transfer events to treasury address
  const events = await provider.getEvents({
    address: USDC_CONTRACT,
    keys: [["0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9"]],
    from_block: { block_number: fromBlock + 1 },
    to_block: { block_number: toBlock },
    chunk_size: 1000,
  });

  let credited = 0;

  for (const event of events.events) {
    const toAddress = event.data[0]?.toLowerCase();
    if (toAddress !== treasury.toLowerCase()) continue;

    const fromAddress = event.keys[1]?.toLowerCase();
    const txHash = event.transaction_hash;

    if (!fromAddress || !txHash) continue;

    // Check if already processed
    const existing = await pool.query(
      "SELECT id FROM deposits WHERE tx_hash = $1",
      [txHash]
    );
    if ((existing.rowCount ?? 0) > 0) continue;

    // USDC amount (low + high uint256, USDC has 6 decimals)
    const low = BigInt(event.data[1] ?? "0");
    const high = BigInt(event.data[2] ?? "0");
    const usdcRaw = low + high * 2n ** 128n;
    const usdcCents = Number(usdcRaw / 10000n); // convert from 6-decimal to cents

    // Read MDLN balance and compute multiplier
    const mdlnBalance = await getMdlnBalance(fromAddress);
    const tier = getTier(mdlnBalance);
    const multiplier = getMultiplier(tier);
    const creditsToAdd = Math.floor((usdcCents / 100) * 100 * multiplier); // $0.01 = 1 credit base

    // Ensure wallet + credits rows exist (wallet may not have signed in yet — skip)
    const walletRow = await pool.query(
      "SELECT address FROM wallets WHERE address = $1",
      [fromAddress]
    );
    if ((walletRow.rowCount ?? 0) === 0) continue; // wallet must have authenticated first

    // Update MDLN tier on wallet
    await pool.query(
      "UPDATE wallets SET mdln_tier = $2 WHERE address = $1",
      [fromAddress, tier]
    );

    // Credit account and record deposit
    await addCredits(fromAddress, creditsToAdd);
    await pool.query(
      `INSERT INTO deposits (address, usdc_amount, tx_hash, multiplier, credited)
       VALUES ($1, $2, $3, $4, $5)`,
      [fromAddress, usdcCents, txHash, multiplier.toFixed(2), creditsToAdd]
    );

    credited++;
  }

  // Save last polled block
  await pool.query(
    `INSERT INTO poll_meta (key, value) VALUES ('last_usdc_block', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [toBlock.toString()]
  );

  return NextResponse.json({ ok: true, credited, fromBlock, toBlock });
}
```

- [ ] **Step 2: Create the poll_meta table (add to a quick migration)**

Run this SQL directly:

```bash
~/.bun/bin/bun -e "
const { Pool } = await import('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(\`
  CREATE TABLE IF NOT EXISTS poll_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
\`);
await pool.end();
console.log('poll_meta created');
"
```

- [ ] **Step 3: Create/update `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/credits/poll",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "credits/poll|poll_meta" | head -10 || echo "Poller OK"
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/credits/poll/route.ts vercel.json
git commit -m "feat: add USDC deposit poller (Vercel cron, 2-min interval)"
```

---

## Task 13: Layout + Provider Cleanup

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/starknet-provider-wrapper.tsx`
- Modify: `src/app/providers.tsx`
- Modify: `src/components/account-button.tsx`

Remove all ChipiPay provider references. Wrap the app in `StarknetProviderWrapper`.

- [ ] **Step 1: Update `src/app/providers.tsx`**

```tsx
import StarknetProviderWrapper from "./starknet-provider-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StarknetProviderWrapper>{children}</StarknetProviderWrapper>;
}
```

- [ ] **Step 2: Update `src/app/starknet-provider-wrapper.tsx`**

Add Cartridge Controller as a third connector option (optional but agent-friendly). If the `@cartridge/connector` package is not installed, skip it and keep only Argent X + Braavos.

```tsx
'use client';

import { StarknetConfig, InjectedConnector, jsonRpcProvider } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';
import type { ReactNode } from 'react';

const connectors = [
  new InjectedConnector({ options: { id: 'argentX' } }),
  new InjectedConnector({ options: { id: 'braavos' } }),
];

export default function StarknetProviderWrapper({ children }: { children: ReactNode }) {
  const nodeUrl = process.env.NEXT_PUBLIC_RPC_URL
    || process.env.NEXT_PUBLIC_STARKNET_RPC_URL
    || 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/tOTwt1ug3YNOsaPjinDvS';

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={jsonRpcProvider({ rpc: () => ({ nodeUrl }) })}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
```

- [ ] **Step 3: Update `src/components/account-button.tsx`**

Show truncated wallet address if connected, otherwise show "Connect Wallet".

```tsx
"use client";

import { useAccount } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export function AccountButton() {
  const { address } = useAccount();

  const label = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <Button asChild className="glass-card rounded-full hover:scale-105 transition-transform" variant="secondary">
      <Link href={address ? "/account" : "/sign-in"}>{label}</Link>
    </Button>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "providers|layout|account-button" | head -20 || echo "Layout OK"
```

- [ ] **Step 5: Commit**

```bash
git add src/app/providers.tsx src/app/starknet-provider-wrapper.tsx src/components/account-button.tsx
git commit -m "feat: clean up providers, wrap app in StarknetConfig, update account button"
```

---

## Task 14: Homepage Content Update

**Files:**
- Modify: `src/app/page.tsx`

Update CTAs, feature chips, pricing cards, and workshop description.

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

Replace the entire file content:

```tsx
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, Key, BarChart2, ArrowRight, Sparkles, Bot, Check, GitFork, MessageSquare, Coins } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const SAMPLE_RESPONSE = `{
  "data": {
    "tokenId": "42",
    "name": "Sonic Bloom #42",
    "description": "Generative audio-visual IP on Starknet.",
    "image": "ipfs://bafybe.../42.png",
    "ipType": "Audio",
    "licenseType": "CC BY",
    "attributes": [
      { "trait_type": "IP Type",      "value": "Audio" },
      { "trait_type": "License Type", "value": "CC BY" },
      { "trait_type": "BPM",          "value": "128" },
      { "trait_type": "Creator",      "value": "0x05f9..." }
    ],
    "remixCount": 3,
    "commentCount": 11
  }
}`

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-24 pb-16 max-w-5xl text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Permissionless IP Infrastructure on Starknet
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Build on Starknet IP
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mint, query and monetize IP assets on Starknet. Connect your wallet and integrate in minutes —
            fully permissionless for humans and AI agents alike.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href="/sign-in">
                <Key className="w-5 h-5 mr-2" />
                Connect Wallet &amp; Build
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-white/10 hover:bg-white/5">
              <Link href="/docs">
                <Code2 className="w-5 h-5 mr-2" />
                Read the Docs
              </Link>
            </Button>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: Code2, label: "IP Metadata" },
              { icon: BarChart2, label: "Collections & Stats" },
              { icon: GitFork, label: "Remix Licensing" },
              { icon: MessageSquare, label: "On-chain Comments" },
              { icon: Bot, label: "Agent-Native Access" },
              { icon: Coins, label: "MDLN Token Benefits" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* Terminal code preview */}
          <div className="mx-auto max-w-2xl text-left mt-8">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">GET /v1/tokens/:contract/:tokenId</span>
              </div>
              <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto leading-relaxed">
                {SAMPLE_RESPONSE}
              </pre>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">FREE</h3>
                  <span className="text-2xl font-extrabold text-white">$0</span>
                </div>
                <p className="text-sm text-muted-foreground">50 credits / month. Connect wallet, start building.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["All API endpoints", "Up to 5 API keys", "Portal dashboard", "Webhooks included"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/sign-in">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Credits */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Pay with USDC</h3>
                  <span className="text-2xl font-extrabold text-white">$0.01<span className="text-sm font-normal text-muted-foreground">/req</span></span>
                </div>
                <p className="text-sm text-muted-foreground">Deposit USDC on-chain. Hold MDLN for up to 2× credit bonus.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Everything in FREE", "Credits never expire", "500 MDLN → 1.2× bonus", "5,000 MDLN → 2.0× bonus"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/pricing">See credit model →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards row */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Agent Quickstart */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Bot className="w-3 h-3 mr-2" />
                  AI Agent Quickstart
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Headless Auth for Agents
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Any agent with a Starknet keypair can authenticate, provision credits, and call the API — 
                  zero human interaction required.
                </p>
                <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary hover:text-primary">
                  <Link href="/docs/agents">
                    Read the guide
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Workshop */}
            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Free Workshop
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Web 2 → Web 3 in 1 Hour
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Full video guide: from zero to a deployed Starknet dApp using
                  Medialane API. In Portuguese.
                </p>
                <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
                  <Link href="/workshop">
                    Watch Workshop
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep "page.tsx" | head -10 || echo "Homepage OK"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update homepage — wallet CTA, agent-native messaging, credit model cards"
```

---

## Task 15: Pricing Page Update

**Files:**
- Modify: `src/app/pricing/page.tsx`

Replace the FREE/PREMIUM binary model with the credit model.

- [ ] **Step 1: Rewrite `src/app/pricing/page.tsx`**

```tsx
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Check, Coins } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const MDLN_TIERS = [
  { mdln: "0 – 499", multiplier: "1.0×", example: "1,000 credits", bonus: "" },
  { mdln: "500 – 1,999", multiplier: "1.2×", example: "1,200 credits", bonus: "bg-primary/10 text-primary border-primary/30" },
  { mdln: "2,000 – 4,999", multiplier: "1.5×", example: "1,500 credits", bonus: "bg-primary/15 text-primary border-primary/40" },
  { mdln: "5,000+", multiplier: "2.0×", example: "2,000 credits", bonus: "bg-primary/20 text-primary border-primary/50" },
]

const FREE_FEATURES = [
  "50 credits / month (resets 1st)",
  "All API endpoints",
  "Up to 5 API keys",
  "Webhooks (4 event types)",
  "Portal dashboard",
]

const CREDIT_FEATURES = [
  "1 USDC = 100 credits",
  "Credits never expire",
  "MDLN holders earn up to 2× bonus credits",
  "Stacks on top of monthly free allowance",
  "402 response + header when balance is 0 (agent-friendly)",
]

export default function PricingPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Simple, on-chain pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Connect your wallet. 50 free credits every month. Pay with USDC when you need more.
            Hold MDLN to earn bonus credits automatically.
          </p>
        </section>

        {/* Plan cards */}
        <section className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">Free Allowance</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">50</span>
                  <span className="text-muted-foreground mb-1.5">credits / month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Starknet wallet and start building immediately. No credit card, no email.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" size="lg">
                  <Link href="/sign-in">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Credits */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  <Coins className="w-3 h-3 mr-1" />
                  On-chain
                </Badge>
              </div>
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">Credit Top-up</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">$0.01</span>
                  <span className="text-muted-foreground mb-1.5">per request</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deposit USDC on-chain. Credits land in your account within ~2 minutes. Never expire.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {CREDIT_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10" size="lg">
                  <Link href="/account">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* MDLN Tier Table */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">MDLN Token Multipliers</h2>
            <p className="text-muted-foreground text-sm">Hold MDLN on Starknet to receive bonus credits on every deposit.</p>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
              <div className="text-sm font-semibold text-muted-foreground">MDLN held</div>
              <div className="text-sm font-semibold text-white text-center">Multiplier</div>
              <div className="text-sm font-semibold text-primary text-center">Per $10 USDC deposit</div>
            </div>
            {MDLN_TIERS.map((row, i) => (
              <div
                key={row.mdln}
                className={`grid grid-cols-3 px-6 py-4 items-center ${i < MDLN_TIERS.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="text-sm text-muted-foreground font-mono">{row.mdln}</div>
                <div className="text-center">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${row.bonus || "text-muted-foreground"}`}>
                    {row.multiplier}
                  </span>
                </div>
                <div className="text-center text-sm text-white font-medium">{row.example}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            MDLN balance is read on-chain at deposit time. No lock-up required.
            Learn more about the <Link href="https://medialane.org/dao/token" className="underline hover:text-white" target="_blank">MDLN token</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep "pricing" | head -10 || echo "Pricing OK"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: update pricing page to credit model with MDLN tier table"
```

---

## Task 16: Docs Update + Agent Quickstart

**Files:**
- Modify: `src/app/docs/page.tsx` (update getting started)
- Create: `src/app/docs/agents/page.tsx` (new agent quickstart)
- Modify: `src/app/docs/layout.tsx` (add Agents to sidebar)
- Modify: `src/components/docs/sidebar.tsx` (add Agents link)

- [ ] **Step 1: Add Agents link to sidebar**

In `src/components/docs/sidebar.tsx`, find the nav items array and add the Agents entry. Read the file first to find the exact structure, then add:

```tsx
{ label: "For AI Agents", href: "/docs/agents" },
```

after the existing SDK entry.

- [ ] **Step 2: Update `src/app/docs/page.tsx` getting started intro**

Find the first paragraph that references email/Clerk/ChipiPay and replace it. The new first paragraph should be:

```tsx
<p>
  Medialane Portal uses your Starknet wallet as your identity. Connect Argent X or Braavos,
  sign a message, and your account is ready — no email or password required. The same flow
  works headlessly for AI agents using any Starknet keypair.
</p>
```

Read the file first to find the exact old text before editing.

- [ ] **Step 3: Create `src/app/docs/agents/page.tsx`**

```tsx
import { DocH2, DocH3, DocCodeBlock } from "@/src/components/docs/typography";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For AI Agents | Medialane Docs",
  description: "Headless authentication and credit management for autonomous AI agents on Starknet.",
};

export default function AgentsPage() {
  return (
    <article className="prose prose-invert max-w-none space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">For AI Agents</h1>
        <p className="text-muted-foreground leading-relaxed">
          Any agent with a Starknet private key can authenticate, top up credits, and call the
          Medialane API — fully headlessly, with no human in the loop at any step.
        </p>
      </div>

      <DocH2>Prerequisites</DocH2>
      <ul className="text-muted-foreground space-y-1 text-sm">
        <li>A Starknet account (keypair). Argent or Braavos account contract deployed on mainnet.</li>
        <li><code>starknet.js</code> v6+ installed in your agent runtime.</li>
        <li>USDC on Starknet for credit top-ups (optional for testing the free 50 credits/month).</li>
      </ul>

      <DocH2>Step 1 — Authenticate (SIWS)</DocH2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Sign-In with Starknet: get a challenge, sign it with your private key, exchange for a session JWT.
      </p>

      <DocCodeBlock lang="typescript">{`import { RpcProvider, Account, ec, stark, typedData } from 'starknet';
import fetch from 'node-fetch';

const PORTAL = 'https://portal.medialane.io';
const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY!;
const ADDRESS = process.env.AGENT_ADDRESS!;

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL! });
const account = new Account(provider, ADDRESS, PRIVATE_KEY);

// 1. Get challenge
const challengeRes = await fetch(\`\${PORTAL}/api/auth/challenge?address=\${ADDRESS}\`);
const { nonce, typedData: td } = await challengeRes.json();

// 2. Sign the typed data
const signature = await account.signMessage(td);
const sigArray = Array.isArray(signature)
  ? signature.map(s => s.toString())
  : [signature.r.toString(), signature.s.toString()];

// 3. Verify — receive session cookie
const verifyRes = await fetch(\`\${PORTAL}/api/auth/verify\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: ADDRESS, nonce, signature: sigArray }),
  // Store the returned Set-Cookie header for subsequent requests
});
const cookies = verifyRes.headers.get('set-cookie');
console.log('Authenticated:', await verifyRes.json());`}</DocCodeBlock>

      <DocH2>Step 2 — Create an API Key</DocH2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Use your session cookie to provision a backend tenant and create an API key. This is idempotent.
      </p>

      <DocCodeBlock lang="typescript">{`// Provision backend tenant (idempotent — safe to call multiple times)
await fetch(\`\${PORTAL}/api/portal/provision\`, {
  method: 'POST',
  headers: { Cookie: cookies },
});

// Create an API key
const keyRes = await fetch(\`\${PORTAL}/api/portal/keys\`, {
  method: 'POST',
  headers: { Cookie: cookies, 'Content-Type': 'application/json' },
  body: JSON.stringify({ label: 'agent-v1' }),
});
const { key } = await keyRes.json(); // store this securely
console.log('API Key:', key);`}</DocCodeBlock>

      <DocH2>Step 3 — Top Up Credits (USDC)</DocH2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Deposit USDC to the Medialane treasury. Credits appear in your account within ~2 minutes.
        If you hold MDLN, the bonus is applied automatically based on your balance at deposit time.
      </p>

      <DocCodeBlock lang="typescript">{`const USDC = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';
const TREASURY = process.env.MEDIALANE_TREASURY_ADDRESS!;

// Deposit $5 USDC (USDC has 6 decimals on Starknet)
const amount = BigInt(5 * 1_000_000); // 5 USDC

const tx = await account.execute([{
  contractAddress: USDC,
  entrypoint: 'transfer',
  calldata: [TREASURY, amount.toString(), '0'],
}]);

await provider.waitForTransaction(tx.transaction_hash);
console.log('Deposit confirmed:', tx.transaction_hash);
// Credits will be credited within ~2 minutes (Vercel cron)`}</DocCodeBlock>

      <DocH2>Step 4 — Check Balance and Handle 402</DocH2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Poll your credit balance programmatically, or handle the <code>402 Payment Required</code> response
        your agent receives when credits reach zero.
      </p>

      <DocCodeBlock lang="typescript">{`// Check balance
const balanceRes = await fetch(\`\${PORTAL}/api/credits/balance\`, {
  headers: { Cookie: cookies },
});
const { balance } = await balanceRes.json();
console.log('Credits remaining:', balance);

// In your API call loop — handle 402 automatically
async function callApi(endpoint: string, apiKey: string): Promise<Response> {
  const res = await fetch(\`https://api.medialane.io/v1/\${endpoint}\`, {
    headers: { 'x-api-key': apiKey },
  });

  if (res.status === 402) {
    console.log('Out of credits — topping up...');
    // trigger deposit flow above, then retry
    throw new Error('OUT_OF_CREDITS');
  }

  return res;
}`}</DocCodeBlock>

      <DocH2>MDLN Token Bonus</DocH2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Agents that hold MDLN in their Starknet wallet receive bonus credits automatically on every deposit.
        No staking or lock-up required — the balance is read on-chain at deposit time.
      </p>
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02] text-sm">
        {[
          ["0 – 499 MDLN", "1.0×", "baseline"],
          ["500 – 1,999 MDLN", "1.2×", "+20% credits"],
          ["2,000 – 4,999 MDLN", "1.5×", "+50% credits"],
          ["5,000+ MDLN", "2.0×", "+100% credits"],
        ].map(([mdln, mult, note]) => (
          <div key={mdln} className="grid grid-cols-3 px-5 py-3 border-b border-white/5 last:border-0 text-muted-foreground">
            <span className="font-mono">{mdln}</span>
            <span className="text-center text-white font-bold">{mult}</span>
            <span className="text-right">{note}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | grep "docs" | head -20 || echo "Docs OK"
```

- [ ] **Step 5: Commit**

```bash
git add src/app/docs/agents/ src/app/docs/page.tsx src/components/docs/sidebar.tsx
git commit -m "feat: add AI agent quickstart docs; update getting started"
```

---

## Task 17: Full Build Verification + Env Vars Checklist

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

```bash
~/.bun/bin/bun run build 2>&1
```

Expected: `✓ Compiled successfully` with 0 TypeScript errors. Static generation warnings about missing `NEXT_PUBLIC_CHIPI_API_KEY` are gone (that var is no longer needed). Static generation may warn about `STARKNET_RPC_URL` — this is expected for server-side env vars and is not a build error.

- [ ] **Step 2: Verify no legacy imports remain**

```bash
grep -r "better-auth\|chipi-stack\|auth-client\|auth\.api\." src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```

Expected: no output. Any matches indicate a missed file that still imports from deleted packages.

- [ ] **Step 3: Verify no plan-tab references remain**

```bash
grep -r "plan-tab\|PlanTab\|plan_tab" src/ --include="*.ts" --include="*.tsx"
```

Expected: no output.

- [ ] **Step 4: Check required env vars are documented**

Add these to `.env.example` (create if it doesn't exist):

```bash
# Auth
JWT_SECRET=                          # min 32 chars, random string
BETTER_AUTH_SECRET=                  # can remove after refactor

# Starknet
STARKNET_RPC_URL=                    # e.g. https://starknet-mainnet.g.alchemy.com/...
NEXT_PUBLIC_RPC_URL=                 # same value, exposed to client
MDLN_CONTRACT_ADDRESS=               # MDLN ERC-20 on Starknet (confirm from medialane-contracts)
TREASURY_ADDRESS=                    # Medialane USDC treasury address
NEXT_PUBLIC_TREASURY_ADDRESS=        # same, exposed to client
CRON_SECRET=                         # secret to protect /api/credits/poll

# Database
DATABASE_URL=                        # PostgreSQL connection string

# Backend
MEDIALANE_API_URL=
MEDIALANE_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://portal.medialane.io
```

- [ ] **Step 5: Run lint**

```bash
~/.bun/bin/bun run lint 2>&1 | tail -20
```

Fix any errors. Warnings are acceptable.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final build verification, env vars checklist, lint fixes"
```

---

## Open Items (resolve before deploy)

1. **MDLN contract address on Starknet** — confirm from `medialane-contracts` repo and set `MDLN_CONTRACT_ADDRESS`.
2. **Treasury address** — confirm or create the Medialane USDC treasury wallet and set `TREASURY_ADDRESS`.
3. **JWT_SECRET** — generate with `openssl rand -hex 32` and set in production env.
4. **CRON_SECRET** — generate and set; configure in Vercel cron headers.
5. **StarkZap** — if the npm package is published by the time of implementation, add it and use its transfer UI in `credits-tab.tsx` instead of the raw `account.execute()` call.
6. **Cartridge Controller** — consider adding `@cartridge/connector` as a third wallet connector; particularly useful for agent testing.
