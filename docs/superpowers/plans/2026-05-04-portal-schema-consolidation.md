# Portal Schema Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three 1:1 wallet tables (`wallets`, `credits`, `wallet_provisioning`) with a single `accounts` table, updating all query sites to match.

**Architecture:** The `accounts` table absorbs all wallet-level columns — identity tier, credit balance, backend API key, and backend tenant reference — with `address` as the primary key. `sessions` and `deposits` update their FK reference from `wallets` to `accounts`. No other tables change. No data migration is needed — the portal has not been deployed against a live database yet.

**Tech Stack:** Next.js 15 App Router, TypeScript, PostgreSQL (raw SQL via `pg`), Bun

---

### Task 1: Rewrite migration script

**Files:**
- Modify: `scripts/migrate.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
// Run once before first deploy: DATABASE_URL=... bun run scripts/migrate.ts
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        address           TEXT PRIMARY KEY,
        mdln_tier         INT NOT NULL DEFAULT 0,
        balance           INT NOT NULL DEFAULT 0,
        backend_tenant_id TEXT,
        backend_api_key   TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address      TEXT NOT NULL REFERENCES accounts(address),
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
        address      TEXT NOT NULL REFERENCES accounts(address),
        token_hash   TEXT NOT NULL,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    await client.query("CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions(address)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_deposits_address ON deposits(address)");

    await client.query("COMMIT");
    console.log("✓ Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Verify the file builds**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)` — no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate.ts
git commit -m "refactor: consolidate wallets/credits/wallet_provisioning → accounts in migration"
```

---

### Task 2: Update `src/lib/credits.ts`

**Files:**
- Modify: `src/lib/credits.ts`

All four functions query the old `credits` table. Replace every occurrence with `accounts`.

- [ ] **Step 1: Replace the entire file**

```typescript
import { pool } from "./db";

export async function getBalance(address: string): Promise<number> {
  const result = await pool.query<{ balance: number }>(
    "SELECT balance FROM accounts WHERE address = $1",
    [address.toLowerCase()]
  );
  return result.rows[0]?.balance ?? 0;
}

export async function addCredits(address: string, amount: number): Promise<void> {
  await pool.query(
    "UPDATE accounts SET balance = balance + $2, updated_at = now() WHERE address = $1",
    [address.toLowerCase(), amount]
  );
}

export async function deductCredit(address: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE accounts SET balance = balance - 1, updated_at = now()
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

- [ ] **Step 2: Build check**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)`

- [ ] **Step 3: Commit**

```bash
git add src/lib/credits.ts
git commit -m "refactor: credits.ts — query accounts table instead of credits"
```

---

### Task 3: Update `src/lib/portal/provision.ts`

**Files:**
- Modify: `src/lib/portal/provision.ts`

Replace the `wallet_provisioning` table reference with `accounts`.

- [ ] **Step 1: Replace the entire file**

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
    "SELECT backend_api_key FROM accounts WHERE address = $1",
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
    body: JSON.stringify({
      name: input.address,
      email: `${input.address}@wallet.medialane.io`,
      plan: "FREE",
    }),
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
    `INSERT INTO accounts (address, backend_api_key, backend_tenant_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (address) DO UPDATE SET backend_api_key = $2, backend_tenant_id = $3`,
    [input.address, plaintext, tenantId]
  );

  return { ok: true };
}
```

- [ ] **Step 2: Build check**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)`

- [ ] **Step 3: Commit**

```bash
git add src/lib/portal/provision.ts
git commit -m "refactor: provision.ts — query accounts table instead of wallet_provisioning"
```

---

### Task 4: Update `src/app/api/auth/verify/route.ts`

**Files:**
- Modify: `src/app/api/auth/verify/route.ts`

Replace the two-step upsert (insert into `wallets` + insert into `credits`) with a single upsert into `accounts`. Replace `wallets` lookup with `accounts`.

- [ ] **Step 1: Replace the entire file**

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

  // Upsert account — creates row on first sign-in
  await pool.query(
    `INSERT INTO accounts (address) VALUES ($1) ON CONFLICT (address) DO NOTHING`,
    [normalizedAddress]
  );

  const account = await pool.query<{ mdln_tier: number }>(
    "SELECT mdln_tier FROM accounts WHERE address = $1",
    [normalizedAddress]
  );
  const mdln_tier = account.rows[0]?.mdln_tier ?? 0;

  const { token, refreshToken } = await createSession({ address: normalizedAddress, mdln_tier });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookies(response, token, refreshToken);
  return response;
}
```

- [ ] **Step 2: Build check**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/verify/route.ts
git commit -m "refactor: auth verify — single upsert into accounts on sign-in"
```

---

### Task 5: Update `src/app/api/credits/poll/route.ts`

**Files:**
- Modify: `src/app/api/credits/poll/route.ts`

Two references to `wallets`: the existence check (line 73–77) and the `mdln_tier` update (line 79). Replace both with `accounts`.

- [ ] **Step 1: Replace the wallet existence check and mdln_tier update**

Find this block (lines 73–85):

```typescript
    const walletRow = await pool.query(
      "SELECT address FROM wallets WHERE address = $1",
      [fromAddress]
    );
    if ((walletRow.rowCount ?? 0) === 0) continue;

    await pool.query("UPDATE wallets SET mdln_tier = $2 WHERE address = $1", [fromAddress, tier]);
```

Replace with:

```typescript
    const accountRow = await pool.query(
      "SELECT address FROM accounts WHERE address = $1",
      [fromAddress]
    );
    if ((accountRow.rowCount ?? 0) === 0) continue;

    await pool.query(
      "UPDATE accounts SET mdln_tier = $2, updated_at = now() WHERE address = $1",
      [fromAddress, tier]
    );
```

The full file after the change:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { RpcProvider } from "starknet";
import { pool } from "@/src/lib/db";
import { getMdlnBalance, getTier, getMultiplier } from "@/src/lib/mdln";
import { addCredits } from "@/src/lib/credits";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
// keccak256("Transfer") selector on Starknet
const TRANSFER_KEY = "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rpcUrl = process.env.STARKNET_RPC_URL;
  const treasury = process.env.TREASURY_ADDRESS?.toLowerCase();

  if (!rpcUrl || !treasury) {
    return NextResponse.json({ error: "STARKNET_RPC_URL or TREASURY_ADDRESS not set" }, { status: 500 });
  }

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const latestBlock = await provider.getBlockNumber();

  const meta = await pool
    .query<{ last_block: number }>(
      "SELECT value::int AS last_block FROM poll_meta WHERE key = 'last_usdc_block'"
    )
    .catch(() => ({ rows: [] as { last_block: number }[] }));

  const fromBlock = meta.rows[0]?.last_block ?? Math.max(0, latestBlock - 100);
  const toBlock = latestBlock;

  if (fromBlock >= toBlock) {
    return NextResponse.json({ ok: true, message: "No new blocks" });
  }

  const events = await provider.getEvents({
    address: USDC_CONTRACT,
    keys: [[TRANSFER_KEY]],
    from_block: { block_number: fromBlock + 1 },
    to_block: { block_number: toBlock },
    chunk_size: 1000,
  });

  let credited = 0;

  for (const event of events.events) {
    const toAddress = event.data[0]?.toLowerCase();
    if (toAddress !== treasury) continue;

    const fromAddress = event.keys[1]?.toLowerCase();
    const txHash = event.transaction_hash;
    if (!fromAddress || !txHash) continue;

    const existing = await pool.query("SELECT id FROM deposits WHERE tx_hash = $1", [txHash]);
    if ((existing.rowCount ?? 0) > 0) continue;

    // USDC has 6 decimals; amount is uint256 (low + high)
    const low = BigInt(event.data[1] ?? "0");
    const high = BigInt(event.data[2] ?? "0");
    const usdcRaw = low + high * 2n ** 128n;
    const usdcCents = Number(usdcRaw / 10_000n);

    const mdlnBalance = await getMdlnBalance(fromAddress);
    const tier = getTier(mdlnBalance);
    const multiplier = getMultiplier(tier);
    const creditsToAdd = Math.floor((usdcCents / 100) * CREDITS_PER_USDC * multiplier);

    const accountRow = await pool.query(
      "SELECT address FROM accounts WHERE address = $1",
      [fromAddress]
    );
    if ((accountRow.rowCount ?? 0) === 0) continue;

    await pool.query(
      "UPDATE accounts SET mdln_tier = $2, updated_at = now() WHERE address = $1",
      [fromAddress, tier]
    );
    await addCredits(fromAddress, creditsToAdd);
    await pool.query(
      `INSERT INTO deposits (address, usdc_amount, tx_hash, multiplier, credited)
       VALUES ($1, $2, $3, $4, $5)`,
      [fromAddress, usdcCents, txHash, multiplier.toFixed(2), creditsToAdd]
    );

    credited++;
  }

  await pool.query(
    `INSERT INTO poll_meta (key, value) VALUES ('last_usdc_block', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [toBlock.toString()]
  );

  return NextResponse.json({ ok: true, credited, fromBlock, toBlock });
}

const CREDITS_PER_USDC = 100;
```

- [ ] **Step 2: Build check**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/credits/poll/route.ts
git commit -m "refactor: poll route — query accounts table instead of wallets"
```

---

### Task 6: Update `src/app/api/portal/[...path]/route.ts`

**Files:**
- Modify: `src/app/api/portal/[...path]/route.ts`

One table reference: `wallet_provisioning` → `accounts`.

- [ ] **Step 1: Replace the query on line 15**

Find:

```typescript
  const row = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM wallet_provisioning WHERE address = $1",
    [session.address]
  );
```

Replace with:

```typescript
  const row = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM accounts WHERE address = $1",
    [session.address]
  );
```

- [ ] **Step 2: Build check**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | grep -E "error|✓ Generating"
```

Expected: `✓ Generating static pages (30/30)`

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/portal/[...path]/route.ts"
git commit -m "refactor: portal proxy — read backend_api_key from accounts"
```

---

### Task 7: Final verification and legacy scan

**Files:** None modified

- [ ] **Step 1: Scan for any remaining references to the old tables**

```bash
grep -r "wallet_provisioning\|FROM wallets\|INTO wallets\|FROM credits\|INTO credits\|UPDATE wallets\|UPDATE credits" \
  /Users/kalamaha/dev/medialane-portal/src/ \
  --include="*.ts" --include="*.tsx"
```

Expected: no output. If any matches appear, update those files to use `accounts` following the same pattern as Tasks 2–6.

- [ ] **Step 2: Full build**

```bash
/Users/kalamaha/.nvm/versions/node/v24.15.0/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Generating static pages (30/30)`, 0 errors, 0 TypeScript issues.

- [ ] **Step 3: Commit if anything was fixed in Step 1, then tag completion**

```bash
git log --oneline -8
```

Expected to see all six task commits above in order.
