# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
# Development
bun dev             # watch mode (localhost:3000)
bun run build       # production build — must pass clean before deploy
bun run lint        # ESLint

# No test runner is configured.
```

`bun` is on PATH via nvm. Do not use `~/.bun/bin/bun` — that path does not exist on this machine.

Always verify `bun run build` passes before any git push. Success indicator: `✓ Generating static pages (N/N)`. Static generation may show WASM async/await warnings from `@cartridge/connector` — these are pre-existing and harmless.

---

## Repository Role

`medialane-portal` is the **developer portal** for Medialane at `portal.medialane.io`.
It is a Next.js 15 App Router site — API key management, usage dashboard, webhooks, and full REST + SDK documentation.

**Do not confuse it with:**
- `medialane-io` — consumer launchpad at `www.medialane.io` (ChipiPay invisible wallet)
- `medialane-dapp` — permissionless dApp at `dapp.medialane.io` (on-chain reads, Starknet wallets)
- `medialane-backend` — the Hono REST API + indexer service
- `medialane-sdk` — the TypeScript SDK (`@medialane/sdk` npm package, v0.6.4)

**Only email in use across the entire platform**: `dao@medialane.org`

---

## Site Map

| Route | Purpose | Touch? |
|---|---|---|
| `/` | Hero + feature chips + MDLN teaser + cards | Yes |
| `/features` | API surface, AI agents (top), webhooks | Yes |
| `/integrate` | Access model, credit costs, consumer app examples | Yes |
| `/pricing` | Permanent redirect → `/integrate` | Yes (redirect only) |
| `/connect` | Community links + contact form | Yes |
| `/docs` | Getting started, credits, use cases | Yes |
| `/docs/api` | Full REST endpoint reference | Yes |
| `/docs/sdk` | @medialane/sdk quickstart + examples | Yes |
| `/docs/agents` | AI agent integration guide | Yes |
| `/changelog` | Static release timeline | Yes |
| `/terms` | Placeholder TOS | Yes |
| `/privacy` | Placeholder privacy policy | Yes |
| `/account` | API portal dashboard (SIWS auth + wallet) | Yes |
| `/mint` | NFT mint page | **DO NOT TOUCH** |
| `/workshop` | Workshop event page | **DO NOT TOUCH** |

---

## Auth System (SIWS — Sign In With Starknet)

**Clerk has been removed.** Auth is now a custom SIWS flow with short-lived JWTs and DB-backed refresh tokens.

### Flow
1. `GET /api/auth/challenge?address=0x...` — returns a `nonce` (stored in DB, 5-min TTL)
2. Client signs typed-data challenge with Starknet wallet
3. `POST /api/auth/verify` — validates signature → issues JWT (`auth-token`, 15 min) + refresh token cookie (`auth-refresh`, 7 days)
4. `POST /api/auth/refresh` — exchanges valid refresh token for new JWT pair (rotation)
5. `POST /api/auth/signout` — deletes refresh token from DB, clears cookies

### Key files
| File | Purpose |
|---|---|
| `src/lib/session.ts` | `createSession`, `getSession`, `refreshSession`, `destroySession`, `setSessionCookies`, `clearSessionCookies` |
| `src/lib/session-edge.ts` | `verifyTokenEdge` — Edge-compatible JWT verify (no Node.js crypto) |
| `src/lib/siws.ts` | Typed-data message construction for SIWS challenges |
| `src/lib/with-auth.ts` | `withAuth(handler)` HOF — wraps API route handlers, returns 401 if session missing |
| `src/middleware.tsx` | Edge middleware — reads `auth-token` cookie, redirects `/sign-in` → `/?connect=1` |
| `src/app/api/auth/challenge/route.ts` | Rate-limited (10 req/min/IP) challenge endpoint |
| `src/app/api/auth/verify/route.ts` | Rate-limited (5 req/min/IP), validates signature elements |
| `src/components/wallet-connect-modal.tsx` | Dialog: Argent X / Braavos / Cartridge Controller → full SIWS flow |

### Cookies
- `auth-token` — JWT, `HttpOnly; SameSite=Strict; Max-Age=900`
- `auth-refresh` — UUID, `HttpOnly; SameSite=Strict; Max-Age=604800`

### Session payload
```ts
type SessionPayload = { address: string; mdln_tier: 0 | 1 | 2 | 3 }
```

### Wallet connect modal
`WalletConnectModal` accepts `open`, `onOpenChange`, `redirectTo` props. It is embedded in `FloatingNav`. Pages that need to trigger wallet connect should link to `/?connect=1` — the `ConnectParamWatcher` in `FloatingNav` opens the modal automatically.

### Starknet provider
`src/app/starknet-provider-wrapper.tsx` loads `ControllerConnector` (Cartridge) **only on the client** via `require()` inside `useMemo` with a `typeof window !== 'undefined'` guard. This prevents WASM from loading during SSR. The package is also in `serverExternalPackages` in `next.config.ts`.

---

## Credit & Access Model

### MDLN Token Gate
Users need a minimum of **500 MDLN** in their wallet to provision any API key. This is a balance check at provisioning time — tokens are never transferred. Tiers stored as `mdln_tier` (0–3) in the `accounts` table.

| MDLN Balance | `mdln_tier` | Credit Multiplier |
|---|---|---|
| < 500 | 0 | No access |
| 500 – 999 | 0 | 1.0× |
| 1,000 – 1,999 | 1 | 1.2× |
| 2,000 – 4,999 | 2 | 1.5× |
| 5,000+ | 3 | 2.0× |

### Variable Credit Costs
Different endpoint categories cost different credits per call:

| Category | Credits |
|---|---|
| Read / query | 1 |
| Trade intents (SNIP-12) | 5 |
| Minting | 10 |
| Launchpad / deploy | 100 |

### 402 Handling
When credits reach zero the API returns `402 Payment Required` with `X-Credits-Remaining: 0`. AI agents detect this and trigger USDC top-up autonomously.

---

## Database

PostgreSQL via `src/lib/db.ts` (pg pool). The `DATABASE_URL` env var is required.

Tables used:
- `accounts` — `address`, `backend_api_key`, `mdln_tier`, `credits`
- `sessions` — `address`, `token_hash` (SHA-256 of refresh token), `expires_at`
- `rate_limits` — `id` (key), `count`, `window_start` — auto-created on startup via `instrumentation.ts`
- `nonces` — SIWS challenge nonces with TTL

### Rate limiting
`src/lib/rate-limit.ts` — `checkRateLimit(key, max, windowSec)` uses PostgreSQL upsert. DB-backed so it works across serverless instances. Challenge endpoint: 10/min/IP. Verify endpoint: 5/min/IP.

### Startup migration
`instrumentation.ts` (project root) — runs `CREATE TABLE IF NOT EXISTS rate_limits` on Next.js startup (Node.js runtime only). No manual SQL needed.

---

## Proxy & Security

### API proxy (`/api/portal/[...path]`)
Reads `backend_api_key` from `accounts` table and proxies to `MEDIALANE_API_URL/v1/portal/*`. Protected by `withAuth`. Path traversal validated: rejects `..`, `.`, and segments containing `/`.

### IPFS proxy (`/api/proxy`)
SSRF-protected: only fetches from a fixed allowlist of IPFS gateways (Pinata, ipfs.io, dweb.link, cloudflare-ipfs.com). Requires session.

### Pinata upload (`/api/pinata`)
Session-guarded. Uses `PINATA_JWT` for authentication.

### Cron (`/api/credits/poll`)
`CRON_SECRET` must be set and non-empty. Validated via `Authorization: Bearer` header. If `CRON_SECRET` is unset, the endpoint returns 403 — it does not fall through to unprotected execution.

---

## Architecture

### Server vs Client Components

Next.js 15 App Router defaults everything to **server components**.
Only add `"use client"` when a component uses hooks, browser APIs, or event listeners.

Current client components (must have `"use client"`):
- `src/components/floating-nav.tsx` — `useState`, `usePathname`, `useSearchParams`, framer-motion, starknet-react hooks
- `src/components/logo-medialane.tsx` — `useMobile()` hook
- `src/components/docs/sidebar.tsx` — `usePathname`
- `src/app/connect/page.tsx` — contact form state
- `src/components/wallet-connect-modal.tsx` — starknet-react hooks, dialog state

Current server components (no `"use client"`):
- `src/components/footer.tsx`
- `src/components/background-gradients.tsx`
- `src/components/docs/typography.tsx`
- All static page files (`/features`, `/integrate`, `/docs`, `/changelog`, etc.)

**Rule**: If a component renders a hook-using child, the child must own `"use client"` — not the parent.

### Layout hierarchy

```
src/app/layout.tsx          ← Root layout: Providers (starknet-react) + FloatingNav + Footer
  src/app/docs/layout.tsx   ← Docs layout: 2-col (DocsSidebar + content)
    src/app/docs/page.tsx
    src/app/docs/api/page.tsx
    src/app/docs/sdk/page.tsx
    src/app/docs/agents/page.tsx
```

`Providers` in `src/app/providers.tsx` wraps starknet-react context including the `StarknetProviderWrapper`.

---

## Key Shared Components

| Component | Path | Purpose |
|---|---|---|
| `BackgroundGradients` | `src/components/background-gradients.tsx` | Fixed purple/cyan gradient blobs — import on full-page routes |
| `DocH2` / `DocH3` / `DocCodeBlock` | `src/components/docs/typography.tsx` | Consistent heading/code styling in docs + legal pages |
| `DocsSidebar` | `src/components/docs/sidebar.tsx` | Sticky left nav for `/docs/*` routes |
| `FloatingNav` | `src/components/floating-nav.tsx` | Top nav — logo, links, wallet button (connect/address/logout). Fixed, ~70px. |
| `Footer` | `src/components/footer.tsx` | 3-column footer + social row |
| `LogoMedialane` | `src/components/logo-medialane.tsx` | Responsive logo (different sizes mobile/desktop) |
| `WalletConnectModal` | `src/components/wallet-connect-modal.tsx` | Argent X / Braavos / Cartridge → full SIWS auth flow |

### Key lib files

| File | Purpose |
|---|---|
| `src/lib/with-auth.ts` | `withAuth(handler)` — auth HOF for API route handlers |
| `src/lib/session.ts` | JWT + refresh token lifecycle |
| `src/lib/session-edge.ts` | Edge-compatible JWT verify |
| `src/lib/rate-limit.ts` | `checkRateLimit(key, max, windowSec)` — DB-backed |
| `src/lib/constants.ts` | Shared constants (`CREDITS_PER_USDC`) |
| `src/lib/db.ts` | PostgreSQL pool (max 10 connections, idle timeout 30s) |

### Adding a new page

1. Does it need the full-bleed background? → `import { BackgroundGradients } from "@/src/components/background-gradients"`
2. Is it a doc-style page? → Use `DocH2`, `DocH3`, `DocCodeBlock` from `@/src/components/docs/typography`
3. Is it inside `/docs`? → It automatically gets the sidebar via `src/app/docs/layout.tsx`
4. Does it need auth? → Use `withAuth` from `src/lib/with-auth.ts` in the API route, not the page

---

## Contact Form (SMTP)

`src/app/connect/page.tsx` → POST `src/app/api/contact/route.ts` → `src/lib/mailer.ts`

Env vars required:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=dao@medialane.org
SMTP_PASS=
CONTACT_TO_EMAIL=dao@medialane.org
CONTACT_FROM_EMAIL=dao@medialane.org
```

The contact route uses Zod for validation. Honeypot field `_hp` blocks bot submissions. HTML output is escaped via `escapeHtml()` in `mailer.ts`.

---

## Design Conventions

- **Dark theme only** — all pages use a dark background, `text-white` / `text-muted-foreground`
- **Glass nav** — `.glass-effect` in `src/app/globals.css` (blur + dark bg/60)
- **Tailwind** — utility-first, no CSS modules. `cn()` from `src/lib/utils.ts` for conditional classes
- **Radix UI** — used for interactive primitives (Collapsible in sidebar, Dialog in wallet modal)
- **Framer Motion** — used only in `floating-nav.tsx` for mobile menu animation
- **No custom fonts beyond Next.js defaults** — standard system font stack

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun (on PATH via nvm) |
| UI | React 19 + Tailwind v3 + Radix UI |
| Animation | Framer Motion |
| Auth | Custom SIWS — JWT (jose) + PostgreSQL refresh tokens. **No Clerk.** |
| Wallet connect | starknet-react + Argent X / Braavos / Cartridge Controller (WASM) |
| On-chain | starknet.js v6 |
| Database | PostgreSQL via `pg` pool |
| Email | nodemailer v8 (SMTP, contact form only) |
| Validation | Zod v3 (contact API route) |
| Path alias | `@/*` → repo root, `@/src/*` → `src/` |

---

## Environment Variables

```
# App
NEXT_PUBLIC_APP_URL=

# Starknet contracts
NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS=
NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_COLLECTION_CONTRACT_HASH=
NEXT_PUBLIC_CONTRACT_ADDRESS_MIP=

# Auth (SIWS)
DATABASE_URL=postgresql://...
JWT_SECRET=                        # random 32+ char string
NEXT_PUBLIC_STARKNET_RPC_URL=      # optional, for agent examples
CRON_SECRET=                       # required for /api/credits/poll

# Pinata IPFS
PINATA_JWT=
PINATA_SECRET=
PINATA_API_KEY=
NEXT_PUBLIC_PINATA_HOST=https://ipfs.io/ipfs

# ChipiPay
NEXT_PUBLIC_CHIPI_API_KEY=
CHIPI_SECRET_KEY=
NEXT_PUBLIC_MERCHANT_WALLET=

# Medialane Backend
MEDIALANE_API_URL=https://medialane-backend-production.up.railway.app
MEDIALANE_API_SECRET=

# SMTP
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=dao@medialane.org
SMTP_PASS=
CONTACT_TO_EMAIL=dao@medialane.org
CONTACT_FROM_EMAIL=dao@medialane.org
```

---

## Common Pitfalls

- **`"use client"` missing on hook-using components** — causes build errors. Add it at the component that owns the hook, not the parent.
- **`bun` path** — use plain `bun` (it's on PATH via nvm). `~/.bun/bin/bun` does not exist on this machine.
- **FloatingNav overlay** — the nav is `position: fixed` and ~70px tall. Pages must use `pt-28` (112px) as top padding. See `/features`, `/account` for the correct pattern.
- **`useSearchParams` Suspense** — any component using `useSearchParams` must be wrapped in `<Suspense>`. See `ConnectParamWatcher` in `floating-nav.tsx` for the pattern.
- **Cartridge WASM in SSR** — `ControllerConnector` must be loaded with `require()` inside `useMemo` with `typeof window !== 'undefined'` guard. It is also in `serverExternalPackages`. Do not import it at module level.
- **`withAuth` HOF** — all protected API routes must use `withAuth`. Don't re-implement session reading inline.
- **`CRON_SECRET` must be non-empty** — if the env var is missing, `/api/credits/poll` returns 403. Never let it fall through unguarded.
- **Git glob with `[...path]`** — quote the path when using git: `git add "src/app/api/portal/[...path]/route.ts"`
- **Footer not rendered** — confirm `<Footer />` is present in `src/app/layout.tsx`.
- **macOS `sed` backreferences** — BSD sed doesn't support `\1`/`\2` in replacement with `-i`. Use the Edit tool instead.
