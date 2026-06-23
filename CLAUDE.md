# CLAUDE.md

Guidance for Claude Code when working in this repository.

> **State: 2026-06-22.** This file was rewritten to match the code after the auth
> rebuild + cleanup. Prior versions described a Clerk/DB/middleware system that no
> longer exists — don't trust older copies. Architecture decisions live in
> `medialane-core/docs/specs/` (see `2026-06-22-portal-admin-signed-request-auth-design.md`).

## Architecture at a glance

`medialane-portal` (`portal.medialane.io`) is a **Next.js 15 App Router** developer
portal: marketing/docs pages, a signed-in **Account console** (API keys, credits,
usage), and an **Admin console**. It is a thin client over `medialane-backend` —
**it holds no database**. Two distinct auth paths, both wallet-signature based:

- **Account console (`/account`)** — connect an injected Starknet wallet → lazy
  **SIWS** sign-in → a `portal-session` JWT cookie. Reads/writes go through the
  `/api/portal/*` proxy to the backend, scoped to the resolved AccountID.
- **Admin console (`/admin`)** — connect an allowlisted wallet → one SNIP-12
  **session-key grant** → every admin request is **signed** and verified by the
  backend (`adminSignatureAuth`). No master key in the browser.

There is **no Clerk, no ChipiPay, no Privy, no Postgres, no middleware** in this app.

---

## Commands

```bash
bun dev             # watch mode (localhost:3000)
bun run build       # production build — MUST pass clean before deploy
bun run lint        # ESLint
# No test runner is configured — verify with `bun run build`.
```

`bun` is on PATH via nvm. **Do not use `~/.bun/bin/bun`** — that path does not exist here.
Build success indicator: `✓ Generating static pages (N/N)`. WASM async/await warnings from
`@cartridge/connector` during static generation are pre-existing and harmless.

Deploy = **push `main`** (Vercel git integration). Wallet/upload flows are prod-only.

---

## Repository Role

`medialane-portal` — the **developer portal** at `portal.medialane.io`. Not to be confused with:
- `medialane-io` — consumer launchpad at `(www.)medialane.io` (Clerk + ChipiPay)
- `medialane-starknet` — permissionless dApp at `starknet.medialane.io` (renamed from `medialane-dapp`)
- `medialane-backend` — the Hono REST API + indexer (the portal's only backend)
- `medialane-sdk` — `@medialane/sdk` (npm; portal pins it for the admin-auth wire format)

**Only email in use across the platform:** `dao@medialane.org`.

---

## Site Map

| Route | Purpose | Touch? |
|---|---|---|
| `/` | Hero + feature chips + cards | Yes |
| `/features`, `/integrate` | API surface, access/credit model, examples | Yes |
| `/pricing` | Permanent redirect → `/integrate` | Redirect only |
| `/connect` | Community links + contact form (SMTP) | Yes |
| `/docs/*` | Permanent redirect → `docs.medialane.io/docs/*` | Redirect only |
| `/changelog`, `/terms`, `/privacy` | Static | Yes |
| `/account` | Signed-in Account console (API Keys, Credits, Usage) | Yes |
| `/admin`, `/admin/*` | Admin console (signed-request auth) — dashboard, services, tenants, claims, collections, coins (+ `/admin/coins/[contract]` settings), reports, moderation, rewards, tokens, creators, maintenance | Yes |
| `/mint`, `/workshop` | **DO NOT TOUCH** |

---

## Wallet

Connect-only, **injected Starknet wallets** (Ready / Braavos) via `@starknet-react/core`,
plus the Cartridge `ControllerConnector` (loaded **client-only**). `autoConnect` is on.

- `src/hooks/use-wallet.ts` — `useWallet()`: thin injected-only shim over starknet-react
  (`address`, `isConnected`, connectors, connect/disconnect). No signing here.
- `src/app/starknet-provider-wrapper.tsx` — loads `ControllerConnector` via `require()` inside
  `useMemo` guarded by `typeof window !== 'undefined'` (keeps WASM out of SSR); also in
  `serverExternalPackages` in `next.config.ts`. Wrapped by `src/app/providers.tsx`.

---

## Account console auth (SIWS → `portal-session` JWT)

Connect ≠ sign. When the user enters `/account`, `usePortalAuth()` drives a lazy SIWS sign-in.
The portal does **not** verify signatures itself — it delegates to the backend's proven verifier.

**Flow:** `GET /api/auth/challenge?address=` (proxies the backend SIWS **nonce**) → wallet signs
the typed data → `POST /api/auth/verify` (delegates to backend `/v1/auth/siws/verify`, then
`POST /admin/accounts/resolve` for the AccountID) → issues a `portal-session` JWT cookie. On
expiry the user re-signs. `POST /api/auth/signout` clears the cookie.

| File | Purpose |
|---|---|
| `src/lib/portal-session.ts` | `createSession` / `getPortalSession` / `setSessionCookie` / `clearSessionCookie` — HS256 JWT (jose), cookie `portal-session`, HttpOnly + SameSite=Strict, 12h. Payload: `{ accountId, chain, address, is_admin }`. |
| `src/lib/portal-auth-client.ts` | `requestPortalSession(address, signer)` — challenge → sign → verify. |
| `src/hooks/use-portal-auth.ts` | `usePortalAuth()` — `session`, `signIn()`, `signOut()` (reads `/api/auth/session`). |
| `src/app/api/auth/{challenge,verify,session,signout}/route.ts` | The four auth endpoints (challenge + verify proxy the backend). |
| `src/lib/starknet-address.ts` | `normalizeStarknetAddress` — lowercase, zero-pad to 64 hex. Use before any address compare. |

**Account console UI:** `src/app/account/page.tsx` → `AccountDashboard` (`dashboard.tsx`) with three
tabs — **API Keys**, **Credits**, **Usage** (`src/components/portal/*-tab.tsx`). Data goes through
the `/api/portal/*` proxy. Credits + x402 are **backend-owned**; the Credits tab reads balance +
history from the account-admin surface and tops up via the backend fund endpoint
(`NEXT_PUBLIC_STARKNET_X402_TREASURY` = Creator's Fund). There is **no MDLN access gate** (MDLN is a
credit *bonus* applied by the backend's x402 multiplier; the marketing copy on `/integrate` +
`/pricing` documents it).

---

## Admin console auth (signed-request session keys)

The admin surface is authorized by an **unforgeable Starknet signature**, verified by the backend —
**no master key in the browser**. Full design: `medialane-core/docs/specs/2026-06-22-portal-admin-signed-request-auth-design.md`.

**Flow:** on `/admin` entry the admin connects an allowlisted wallet and signs **one** SNIP-12 grant
authorizing an ephemeral session key (`startAdminSession`, stored in `sessionStorage`, short TTL).
Every admin request is then signed by that key via the shared `adminFetch` and sent to the
secret-less `/api/admin/[...path]` forwarder, which passes the `x-ml-admin-*` headers to the backend;
`adminSignatureAuth` verifies the grant signature, the allowlist, the request signature, and replay.

| File | Purpose |
|---|---|
| `src/lib/admin-fetch.ts` | **The one way to call the admin API.** `adminFetch(path, opts)` signs the request (SDK `encodeAdminHeaders`). Accepts `/admin/…` or `/api/admin/…`. **Every admin call — reads + writes — must use this.** Also exports `runAdminAction(path, { method, body, success?, errorPrefix? })` — see feedback below. |
| `src/lib/admin-session.ts` | `startAdminSession` / `getAdminSession` / `clearAdminSession` (sessionStorage). |
| `src/lib/admin-allowlist.ts` | `isAdminAddress` — **client UI hint only** (`NEXT_PUBLIC_STARKNET_ADMIN_ADDRESSES`); decides whether to show admin UI, NOT a boundary. |
| `src/app/admin/layout.tsx` | Connect + one-signature sign-in gate; nav uses Next `<Link>` (client-side — never `<a>`, which full-reloads and drops the wallet). |
| `src/hooks/use-admin.ts` | SWR read hooks (`useAdminCollections`, `useAdminCoins`, …) — all call `adminFetch`. |

**Authority is server-side:** the backend env `STARKNET_ADMIN_ADDRESSES` is the real allowlist
(checked after the signature). Until it's set in Railway, every admin request 403s.

**Two server-side exceptions** (legitimate, key never reaches the browser): `src/app/admin/page.tsx`
(dashboard stats) and `src/app/admin/services/page.tsx` (services catalog) are **server components**
that read the backend directly with `ADMIN_API_KEY`. Everything client-side uses `adminFetch`.

**Coin settings:** `/admin/coins/[contract]` is a dedicated page (not a modal) with a feature-image
uploader — see "Image upload" below. Collections still uses an inline modal (fast-follow to match).

**Admin action feedback (mandatory pattern).** Admin pages give feedback via **`sonner`** toasts —
mounted as `<SonnerToaster/>` in the root layout (rich colors, close button, top-center). For any
admin **write**, use **`runAdminAction`** rather than a bare `adminFetch` + generic `toast.error`:

```ts
const r = await runAdminAction(`/admin/coins/${addr}`, { method: "PATCH", body, success: "Coin updated" });
if (r) await mutate();   // r is the parsed response, or null (error already shown)
```

It surfaces the backend's real `{ error }` message in a long-lived, dismissible toast (never a generic
"Failed"). The coin **settings page** uses a persistent inline banner instead (its save is multi-step).
Do **not** reintroduce: a bare `toast.error("Failed")` that swallows the reason, or a `sonner` `toast()`
without the mounted `<SonnerToaster/>` (its toasts render nothing — the original "admin feedback is
broken" bug). The shadcn `Toaster` (`ui/toaster`, `use-toast`) is also mounted, used by `MediaUploader`.

---

## API routes & proxies

| Route | Purpose |
|---|---|
| `/api/portal/[...path]` | Account proxy. `getPortalSession()` → 401 if unsigned; forwards to `${MEDIALANE_API_URL}/admin/accounts/{accountId}/<path>` with `MEDIALANE_API_SECRET`. Path-traversal guarded. |
| `/api/admin/[...path]` | **Secret-less** admin forwarder — holds no secret, makes no auth decision; forwards the signed `x-ml-admin-*` headers + body verbatim to `${MEDIALANE_API_URL}/admin/<path>`. The backend verifies. `health` + `tokens/[contract]/[tokenId]` are thin **public** forwarders (read public backend endpoints). |
| `/api/auth/{challenge,verify,session,signout}` | SIWS (challenge + verify proxy the backend; session reads the cookie). |
| `/api/pinata` | GET returns a short-lived Pinata **signed upload URL** (no auth gate; client uploads directly). Uses `PINATA_JWT`. |
| `/api/proxy` | SSRF-guarded IPFS gateway proxy (fixed gateway allowlist). |
| `/api/contact` | Contact form → SMTP (`src/lib/mailer.ts`), Zod-validated, honeypot `_hp`, escaped HTML. |

No middleware. Page-level access is a client UX gate; the real boundary is the backend (signed admin
auth / `portal-session` on the proxy).

---

## Image upload (IPFS)

Reusable, no new infra:
- `src/components/mediaUploader.tsx` — `<MediaUploader label initialUrl onChange={(url, file?)=>…} />`:
  **Upload (dropzone)** + **URL (paste)** tabs with live preview. On file-select calls
  `onChange(dataURL, file)`; on URL calls `onChange(url)`.
- `src/hooks/useIpfs.tsx` — `useIpfsUpload().uploadToIpfs(file, meta)` → uploads via the `/api/pinata`
  signed URL, returns `{ fileUrl, metadataUrl, cid }`.
- Pattern (see `/admin/coins/[contract]`): on save, if a file was chosen → `uploadToIpfs` → use
  `fileUrl`; else if a real (non-`data:`/`blob:`) URL was pasted → use it. Never persist a preview URL.

---

## Server vs Client Components

App Router defaults to **server components**; add `"use client"` only when a component uses hooks,
browser APIs, or events. If a parent renders a hook-using child, the **child** owns `"use client"`.
Root layout (`src/app/layout.tsx`) = `Providers` (starknet-react) + `FloatingNav` + `Footer`.

---

## Design Conventions

- **Dark theme only** — dark bg, `text-white` / `text-muted-foreground`.
- **Glass nav** — `.glass-effect` in `src/app/globals.css`.
- **Tailwind** utility-first (no CSS modules); `cn()` from `src/lib/utils.ts`.
- **Radix UI** primitives (`src/components/ui/*`); **Framer Motion** only in `floating-nav.tsx`.
- System font stack; no custom fonts.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun (on PATH via nvm) |
| UI | React 19 + Tailwind v3 + Radix UI |
| Auth | Wallet-signature: SIWS → `portal-session` JWT (account); SNIP-12 session-key signed requests (admin). JWT via `jose`. **No DB, no Clerk.** |
| Wallet | `@starknet-react/core` + injected (Ready/Braavos) + Cartridge Controller (WASM) |
| On-chain / SDK | `starknet` v6, `@medialane/sdk` (admin-auth wire format) |
| Email | nodemailer (SMTP, contact form only) |
| Validation | Zod v3 |
| Path alias | `@/*` → repo root, `@/src/*` → `src/` |

---

## Environment Variables

```
# App / public
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STARKNET_RPC_URL=            # (or NEXT_PUBLIC_RPC_URL)
NEXT_PUBLIC_EXPLORER_URL=                # Voyager/Starkscan base (no trailing slash)
NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_CONTRACT_ADDRESS_MIP=
NEXT_PUBLIC_IPFS_GATEWAY=                # (and/or NEXT_PUBLIC_PINATA_GATEWAY / NEXT_PUBLIC_PINATA_HOST)
NEXT_PUBLIC_STARKNET_X402_TREASURY=      # Creator's Fund (credit top-ups)
NEXT_PUBLIC_STARKNET_ADMIN_ADDRESSES=    # admin UI hint (comma-separated); NEXT_PUBLIC_ADMIN_ADDRESSES = transitional fallback

# Auth / backend
JWT_SECRET=                              # 32+ chars — signs the portal-session JWT
MEDIALANE_API_URL=https://medialane-backend-production.up.railway.app
MEDIALANE_API_SECRET=                    # account-scoped portal service secret (used by /api/portal)
ADMIN_API_KEY=                           # master key — SERVER-SIDE ONLY (admin dashboard/services server components)

# Pinata IPFS
PINATA_JWT=
NEXT_PUBLIC_PINATA_HOST=https://ipfs.io/ipfs

# SMTP (contact form)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=dao@medialane.org
SMTP_PASS=
CONTACT_TO_EMAIL=dao@medialane.org
CONTACT_FROM_EMAIL=dao@medialane.org
```

No `DATABASE_URL`, no `CRON_SECRET`, no Clerk/ChipiPay secrets — those systems were removed.

---

## Common Pitfalls

- **Every admin API call goes through `adminFetch`** (`src/lib/admin-fetch.ts`) — never raw `fetch` to
  `/api/admin/*`, or it reaches the backend unsigned and 401s. Server components are the only exception
  (they use `ADMIN_API_KEY` server-side).
- **Admin/account nav must be `<Link>`, not `<a>`** — a plain `<a>` full-reloads the document, tears
  down the wallet context, and drops the session.
- **Admin write feedback** — use `runAdminAction` (specific, visible, dismissible). Admin toasts are
  `sonner` and require the mounted `<SonnerToaster/>`; a `sonner` `toast()` with no mounted toaster
  renders nothing.
- **Image upload** — reuse `<MediaUploader>` + `useIpfsUpload`; never add a new uploader. Uploads need a
  valid `PINATA_JWT` (with upload scope) on the server; `/api/pinata` returns the real reason on failure.
- **`"use client"`** on the component that owns the hook, not the parent.
- **`bun` path** — plain `bun` (nvm), never `~/.bun/bin/bun`.
- **FloatingNav overlay** — fixed, ~70px; pages use `pt-28` top padding.
- **`useSearchParams` Suspense** — wrap in `<Suspense>` (see `ConnectParamWatcher`).
- **Cartridge WASM in SSR** — load `ControllerConnector` via `require()` in `useMemo` with a `window`
  guard; it's also in `serverExternalPackages`. Never import at module level.
- **Git glob with `[...path]`** — quote it: `git add "src/app/api/admin/[...path]/route.ts"`.
- **macOS `sed`** — BSD sed lacks `\1` backrefs with `-i`; use the Edit tool.
