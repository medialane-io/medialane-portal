# Unify portal wallet auth with the dapp system

**Date:** 2026-06-15
**Repo:** medialane-portal
**Branch:** feat/unify-wallet-auth-dapp-system

## Problem

The portal runs a bespoke auth stack that diverges from medialane-dapp and has
repeatedly failed in production:

- Connecting a wallet immediately forces a "Sign in to Medialane" signature.
- The portal **re-invents signature verification** (own `nonces` table, own
  on-chain check) instead of reusing the dapp's proven wallet system.
- It layers JWT + DB-backed refresh-token rotation + HttpOnly cookies + edge
  middleware on top.
- The live symptom: Braavos sign-in dies at **"Invalid signature format"** —
  the modal hand-serialized the signature into a shape the verify route
  rejected (`length > 4`, `0x`-only). A surgical patch exists on this branch,
  but the real fix is to stop diverging.

Two apps, two wallet/auth systems, is the root cause. The goal is **one shared
client wallet system** with the dapp, with a verification model chosen for
**security first**.

## Goals

1. **Unify the client wallet system with the dapp** — same connect-only UX,
   same `useWallet()` hook shape, same lazy "sign only when needed" flow. New
   portal *client* code should feel identical to dapp code. (Token **transport**
   differs by necessity — see the cookie decision below — but the wallet
   components and UX are shared.)
2. **Security is the top priority** — wallet-signature verification must stay
   inside the portal's own trust boundary. The backend (an indexer / cache) must
   **never** be a trust anchor for identity, so a backend compromise can never
   forge a user — and especially never forge an admin.
3. **Clean and elegant** — one verification path for everyone (normal user and
   admin alike); delete machinery that isn't load-bearing.

## Non-goals

- No new wallet kinds. Portal stays **Ready / Braavos** (+ AI agents via API
  keys), per the per-app wallet-kind rule. No Privy / Cartridge / StarkZap.
- No change to the credit/MDLN-tier model or the API-key proxy data flow (the
  portal proxies to the backend with the per-account `backend_api_key`, not the
  user's session token — so the session is identity only).
- No change to where admin authority lives: `accounts.is_admin` in the portal
  DB remains the single source of truth.

## Design

### Layer split

| Layer | Source | Notes |
|---|---|---|
| **Client wallet system** | ported from dapp | connect-only UX, `useWallet()`, lazy sign-on-demand |
| **Identity verification** | **portal-local, single path** | portal verifies the wallet signature on-chain itself and issues one short-lived token |
| **Token transport** | **short-lived HttpOnly cookie** | so SSR admin pages stay server-gated before render (security) — not localStorage |
| **Admin authority** | portal DB `accounts.is_admin` | re-checked server-side per admin request |

### Why a cookie, not the dapp's localStorage token (security)

The dapp stores its SIWS token in `localStorage`. The portal **cannot**, because
`/admin/*` pages render data **server-side** (RSC), and edge middleware / RSC
can't read `localStorage`. A localStorage-only token would let the server render
admin data before knowing the caller is an admin — a leak. So the portal-issued
token is a short-lived **HttpOnly cookie**: the edge middleware verifies it and
gates `/admin/*` *before* any RSC renders. The shared, unified part is the
**client wallet system** (connect-only, `useWallet()`, lazy sign); the cookie is
an intentional, security-driven deviation in token transport only.

### Connect → sign flow (matches dapp)

1. User clicks **Connect** → wallet connects. **No signature.** They can browse.
2. When an action needs an authenticated identity (provision an API key, open
   `/admin/*`, call a protected route), the lazy SIWS hook checks whether a
   valid session cookie is already present.
3. If none, it requests a challenge, the wallet signs it once, the **portal**
   verifies and issues a short-lived token as an HttpOnly cookie.
4. Subsequent requests carry the cookie until it expires; on expiry the user
   simply re-signs (off-chain, free, no gas) — no refresh-token machinery.

### Verification (security core)

- The portal issues a short-TTL challenge (server-stored nonce, single-use,
  ~5-min TTL) — replay protection is a security requirement, so the nonce table
  stays.
- The wallet signs SNIP-12 typed data binding `{ nonce, address }`.
- The portal verifies via the account contract's **`is_valid_signature`**
  (account-abstraction correct: handles Braavos/Argent custom signers,
  multisig, hardware signers — never raw-curve verification).
- On success the portal mints **its own** short-lived token (signed with the
  portal's `JWT_SECRET`), set as an HttpOnly cookie. The token asserts
  `{ address, mdln_tier, is_admin }`, read from the portal DB at issue time.
- **The backend is not consulted for identity at any point.**

### Signature serialization

Client uses `stark.formatSignature(signature)` (handles every wallet shape).
Server accepts felt strings (hex or decimal), length 1–32; the authoritative
check is the on-chain `is_valid_signature` call, not the format guard.

### Admin gate

- `accounts.is_admin` (portal DB) is the single source of truth, set via
  `scripts/set-admin.ts`.
- Page protection: edge middleware reads the session cookie and gates `/admin/*`
  **before** any RSC renders (kept — this is why the token is a cookie).
  Authoritative re-check of `is_admin` against the DB on every `/api/admin/*`
  request via `with-admin.ts` (unchanged).
- Because identity itself is portal-verified, admin cannot be forged by a
  backend compromise. Same single verification path as every other user.

### What gets removed

- `sessions` table + DB-backed refresh-token rotation.
- `/api/auth/refresh` (refresh rotation). `/api/auth/signout` reduces to a
  client-side token clear.
- The hand-rolled signature serialization in the connect modal.
- The forced sign-at-connect modal step (replaced by lazy sign-on-demand).

### What stays

- `nonces` table (replay protection) and a single verify endpoint.
- On-chain `is_valid_signature` verification (the secure core).
- `accounts` table, `is_admin`, MDLN tier, credits, API-key proxy.
- The portal-issued token + `JWT_SECRET` (now the only token type).

## Components ported from the dapp (trimmed)

- StarknetProvider with injected connectors only (Ready/Braavos) — the portal
  already has `starknet-provider-wrapper.tsx`; align it with the dapp's
  connector setup (the `idResolvedReady` alias handling for the Ready rebrand).
- A `useWallet()`-shaped hook for the portal: `{ address, isConnected,
  isConnecting, connect, disconnect }`. Portal has no StarkZap, so no
  active-wallet-slot referee is needed — injected-only is inherently single-rail.
- A lazy SIWS hook mirroring the dapp's `use-siws-token` (`getValidToken()` /
  `signIn()`), but pointed at the **portal's** verify endpoint (which sets the
  cookie), not the backend. No client-side token store needed — the cookie is
  the session; the hook just triggers sign-on-demand when no valid session
  exists.

## Migration / DB

- Drop `sessions` table (after deploy of code that no longer reads it).
- Keep `nonces`, `accounts`, `rate_limits`.
- **Schema-touching → verify against prod DB** (`DATABASE_PUBLIC_URL`) before
  and after: confirm no code path still references `sessions`, confirm row
  counts/admin flags intact post-migration.

## Testing / verification

- `bun run build` clean (`✓ Generating static pages (N/N)`).
- Manual prod smoke (auth/wallet is prod-only on this app): connect → browse
  without signing → trigger a protected action → sign once → verify token
  issued → admin wallet reaches `/admin`, non-admin is bounced.
- Confirm a Braavos signature (the original failure) now verifies end to end.

## Rollout

- Branch `feat/unify-wallet-auth-dapp-system`. PR, not direct-to-main, because
  this touches auth + admin + schema.
- Deploy = push to `main` (Vercel git integration) only on explicit user
  authorization. No unauthorized prod writes; no table drop without sign-off.

## Cross-repo note

The architectural decision — "portal and dapp share one client wallet system;
portal verifies identity locally for security" — should be recorded in
`medialane-core/docs/architecture/` as the source of truth, since it spans repos.
