# Portal Schema Consolidation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three 1:1 wallet tables (`wallets`, `credits`, `wallet_provisioning`) with a single `accounts` table, eliminating join overhead and split-brain risk while keeping all other tables unchanged.

**Architecture:** Single `accounts` table with `address` as primary key holds all wallet-level data — identity tier, credit balance, and backend integration references. `sessions`, `nonces`, `deposits`, and `poll_meta` are unchanged; `sessions` and `deposits` update their FK reference from `wallets` to `accounts`.

**Tech Stack:** PostgreSQL (raw SQL via `pg`), Next.js 15 API routes, TypeScript

---

## Schema

### New table

```sql
CREATE TABLE accounts (
  address           TEXT PRIMARY KEY,
  mdln_tier         INT NOT NULL DEFAULT 0,
  balance           INT NOT NULL DEFAULT 0,
  backend_tenant_id TEXT,
  backend_api_key   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Unchanged tables

- `sessions(id, address → accounts, token_hash, expires_at, created_at)`
- `nonces(nonce, address, expires_at)`
- `deposits(id, address → accounts, usdc_amount, tx_hash, multiplier, credited, created_at)`
- `poll_meta(key, value)`

### Removed tables

- `wallets` — fields absorbed into `accounts`
- `credits` — fields absorbed into `accounts`
- `wallet_provisioning` — fields absorbed into `accounts`

## Migration Strategy

No data migration required — the portal has not been deployed to production and the migration script has not run against a live database. The migration script is rewritten from scratch to create the new schema directly.

## Files Changed

| File | Change |
|------|--------|
| `scripts/migrate.ts` | Rewrite: single `accounts` table, updated FKs on `sessions` and `deposits` |
| `src/lib/credits.ts` | Query `accounts` instead of `credits` |
| `src/lib/portal/provision.ts` | Single `INSERT INTO accounts ON CONFLICT DO UPDATE` instead of two inserts |
| `src/app/api/auth/verify/route.ts` | Upsert `accounts` on sign-in instead of `wallets` |
| `src/app/api/credits/poll/route.ts` | Wallet lookup and `mdln_tier` update on `accounts` |
| `src/app/api/portal/[...path]/route.ts` | Read `backend_api_key` from `accounts` |
| `src/app/api/portal/provision/route.ts` | Row existence check on `accounts` |

Files not changed: `src/lib/session.ts`, `src/app/api/credits/balance/route.ts`, `src/app/api/credits/history/route.ts`, `src/components/portal/credits-tab.tsx`.
