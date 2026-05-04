# Medialane Portal — Web3 Refactor Design Spec

**Date**: 2026-05-04  
**Status**: Approved  
**Scope**: Full replacement of email/password auth and ChipiPay wallet with wallet-native identity (SIWS), on-chain credit top-up via StarkZap, and MDLN token tier benefits. Site-wide content refresh.

---

## 1. Goals

- Replace all email/password auth and third-party auth vendors (Better Auth, Clerk remnants) with Sign-In with Starknet (SIWS) — wallet signature = identity.
- Enable fully permissionless access for autonomous AI agents and humans on equal footing: same auth protocol, same API surface.
- Introduce an on-chain credit model (USDC deposit via StarkZap) with MDLN token multipliers for fee discounts.
- Delete all broken and legacy code (Better Auth, ChipiPay, onboarding flow, sign-up page).
- Refresh site content to reflect the new stack, positioning, and agent-native narrative.

---

## 2. Non-Goals

- Smart contract deployment (credits tracked in PostgreSQL, not on-chain).
- Multi-wallet per account (one wallet address = one account, clean and simple).
- Account recovery (wallet = key material; no fallback email or social login).
- Migration of existing users (partners notified after launch; clean slate).

---

## 3. Architecture

### 3.1 Three-Layer Model

```
Identity Layer       SIWS (Sign-In with Starknet)
                     wallet_address → JWT (15 min) + refresh token (7 days)
                     wallet_address is the primary key everywhere

Financial Layer      StarkZap SDK
                     USDC deposit to Medialane treasury (on-chain)
                     MDLN balance read (on-chain, at deposit time)
                     PostgreSQL tracks credit balance

API Access Layer     API keys tied to wallet_address
                     Generated/revoked via authenticated session
                     Agents: headless 3-step flow (challenge → sign → key)
                     Humans: same flow through dashboard UI
```

### 3.2 What Gets Deleted

| Package / File | Reason |
|---|---|
| `better-auth`, `@better-fetch/fetch` | Replaced by SIWS + custom JWT |
| `@chipi-stack/nextjs`, `@chipi-stack/chipi-passkey` | Replaced by StarkZap |
| `src/lib/auth.ts`, `src/lib/auth-client.ts` | Full rewrite |
| `src/app/sign-up/page.tsx` | No sign-up flow; wallet = account |
| `src/app/onboarding/` | No onboarding; wallet connect = ready |
| `src/components/chipi/` | Replaced by StarkZap credit UI |
| `src/components/auth/wallet-guard.tsx` | Replaced by new middleware |

### 3.3 What Gets Added

| File | Purpose |
|---|---|
| `src/lib/siws.ts` | Nonce generation + Starknet signature verification |
| `src/lib/session.ts` | JWT create / verify / refresh / destroy |
| `src/lib/credits.ts` | Credit balance read/write in PostgreSQL |
| `src/lib/mdln.ts` | On-chain MDLN balance read via starknet.js |
| `src/app/api/auth/challenge/route.ts` | GET — generate nonce for address |
| `src/app/api/auth/verify/route.ts` | POST — verify signature, issue JWT |
| `src/app/api/auth/signout/route.ts` | POST — clear cookies |
| `src/app/api/auth/refresh/route.ts` | POST — rotate JWT silently |
| `src/app/api/credits/deposit/route.ts` | Internal — poll + credit deposits |
| `src/components/wallet-connect.tsx` | Connect button for humans (starknet-react) |
| `src/components/portal/credits-tab.tsx` | Replaces the Wallet tab — Add Credits UI, USDC balance, MDLN tier display |

### 3.4 What Stays

- `@starknet-react/core` + `StarknetProviderWrapper` (extended, not replaced)
- PostgreSQL + `src/lib/db.ts`
- All portal tab components (`api-keys-tab`, `usage-tab`, `webhooks-tab`, `plan-tab`)
- REST proxy and portal API routes (`src/app/api/portal/`)
- All public pages (`/features`, `/pricing`, `/connect`, `/docs`, `/changelog`)
- Layout, nav, footer, background gradients, design system

---

## 4. Auth Layer

### 4.1 SIWS Flow

```
1. GET /api/auth/challenge?address=0x...
   → Generate UUID nonce, store with address + 5-min TTL in `nonces` table
   → Return { nonce, message }
   Message format:
     "Sign in to Medialane Portal\nAddress: {address}\nNonce: {nonce}\nIssued: {ISO timestamp}"

2. Wallet signs message
   → Browser: starknet-react account.signMessage()
   → Agent: starknet.js account.signMessage() — no browser required

3. POST /api/auth/verify { address, signature }
   → Verify signature: starknet.js ec.starkCurve.verify()
   → Consume and delete nonce
   → Upsert wallet_address into `wallets` table (first visit = account created)
   → Issue JWT (httpOnly cookie, 15 min)
   → Issue refresh token (httpOnly cookie, 7 days, stored hash in `sessions` table)

4. Middleware on /account/*
   → Verify JWT from cookie
   → On expiry: POST /api/auth/refresh silently rotates
   → On signout: POST /api/auth/signout clears cookies + invalidates refresh token
```

### 4.2 JWT Payload

```json
{
  "sub": "0x04f9...",
  "mdln_tier": 1,
  "exp": 1234567890
}
```

`mdln_tier` embedded to avoid DB hit on every request. Refreshed on JWT rotation. No `plan` field — the new model has no plan tiers, only credits.

### 4.3 Agent Headless Flow

Agents use the same three API endpoints with no browser:
```bash
# 1. Get challenge
GET /api/auth/challenge?address=0x...

# 2. Sign message with private key (starknet.js)
# 3. Verify and receive JWT in cookie header
POST /api/auth/verify

# 4. Use JWT to create API key via portal API
POST /api/portal/keys
```

Once an API key is issued, agents use it directly — no session refresh needed.

---

## 5. Credit System

### 5.1 Credit Model

- 1 credit = 1 API request
- 1 USDC = 100 credits ($0.01 per request)
- FREE allowance: 50 credits/month included for every wallet, resets on the 1st (no deposit required)
- Purchased credits stack on top of the free allowance; never expire
- No plan tiers — webhooks and all API features available to any wallet with a positive balance

### 5.2 MDLN Tier Multipliers

| MDLN held | Multiplier | $10 USDC deposit yields |
|-----------|-----------|------------------------|
| 0 – 499 | 1.0x | 1,000 credits |
| 500 – 1,999 | 1.2x | 1,200 credits |
| 2,000 – 4,999 | 1.5x | 1,500 credits |
| 5,000+ | 2.0x | 2,000 credits |

MDLN balance is read on-chain at deposit time. Tier is not locked — it reflects holdings at the moment of each deposit.

### 5.3 Deposit Flow

```
1. User clicks "Add Credits" → enters USDC amount
2. StarkZap initiates transfer to Medialane treasury address
3. Transaction signed in wallet, submitted to Starknet
4. Backend cron route (`GET /api/credits/poll`, triggered by Vercel cron every 2 min) polls treasury address for incoming USDC transfers
5. On match: read sender MDLN balance on-chain → apply multiplier → credit account in PostgreSQL
6. Deposit recorded in `deposits` table with tx_hash (unique constraint prevents double-credit)
```

### 5.4 Depletion Behaviour

When credits reach zero:
- API returns `402 Payment Required`
- Response header: `X-Credits-Remaining: 0`
- Agents detect this and top up autonomously via the deposit flow

### 5.5 PostgreSQL Schema (additions)

```sql
CREATE TABLE wallets (
  address     TEXT PRIMARY KEY,
  mdln_tier   INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credits (
  address     TEXT PRIMARY KEY REFERENCES wallets(address),
  balance     INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deposits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address      TEXT NOT NULL REFERENCES wallets(address),
  usdc_amount  INT NOT NULL,
  tx_hash      TEXT UNIQUE NOT NULL,
  multiplier   NUMERIC(4,2) NOT NULL,
  credited     INT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nonces (
  nonce      UUID PRIMARY KEY,
  address    TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sessions (
  id           UUID PRIMARY KEY,
  address      TEXT NOT NULL REFERENCES wallets(address),
  token_hash   TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Content Updates

### Homepage (`/`)
- Hero CTA: "Get Free API Key" → "Connect Wallet & Build" (→ `/sign-in`)
- Feature chips: add "Agent-Native Access", remove "Orders & Listings"
- Mini pricing cards: FREE stays; PREMIUM → "Pay with USDC · MDLN discounts"
- Workshop card: remove Clerk/ChipiPay references from description
- Add third card: "AI Agent Quickstart" → `/docs/agents`

### Pricing (`/pricing`)
- PREMIUM price: "Custom" → credit rate table ($0.01/credit, MDLN tier table)
- Add MDLN tier benefits section below comparison table
- CTA: "Request Access" email → "Connect Wallet" → dashboard

### Docs (`/docs`, `/docs/api`, `/docs/sdk`)
- Getting started: lead with wallet connect flow, not email/API key form
- New section: `/docs/agents` — headless auth flow with starknet.js code examples
- SDK docs: add StarkZap deposit example, update to SDK v0.6.4
- Remove all Clerk/ChipiPay references

### Account Dashboard (`/account`)
- Wallet tab → renamed **Credits tab**: StarkZap USDC balance display + "Add Credits" button + MDLN tier badge + deposit history
- Plan tab: remove entirely (no plans in new model); fold relevant info into Credits tab
- Remove onboarding redirect; wallet connect lands directly in dashboard

### Deleted Pages
- `/sign-up` — deleted
- `/onboarding` — deleted

---

## 7. StarkZap Integration Points

| Use case | StarkZap API |
|---|---|
| USDC deposit (frontend) | `sdk.transfer({ token: USDC, to: TREASURY, amount })` |
| MDLN balance read (backend) | `sdk.balance({ token: MDLN, address })` |
| USDC balance display (dashboard) | `sdk.balance({ token: USDC, address })` |

StarkZap is **not** used for auth. Auth is SIWS only.

---

## 8. Starknet Provider

`StarknetProviderWrapper` stays. Add StarkZap provider wrapping inside it. Keep Argent X + Braavos injected connectors. Consider adding Cartridge Controller as a third connector (it's one of StarkZap's recommended onboarding strategies and is popular with agents/games).

---

## 9. Open Questions (resolved before implementation)

- **Treasury address**: Medialane multisig or EOA? Confirm address before wiring deposit polling.
- **MDLN contract address on Starknet**: confirm from `medialane-contracts` repo.
- **USDC contract address on Starknet**: standard — `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8`.
- **Cartridge Controller**: include as connector yes/no? (recommended for agents)
- **FREE allowance framing**: resolved as 50 credits/month (identical number, aligned with credit model).

---

## 10. Success Criteria

- A human can connect Argent X, land on dashboard, generate an API key, and make an API call — in under 2 minutes, no email required.
- An AI agent with a Starknet private key can headlessly authenticate, provision credits, and use the API with zero human intervention.
- `bun run build` passes with 0 errors after the refactor.
- No Clerk, Better Auth, or ChipiPay imports remain in the codebase.
