# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
# Development
~/.bun/bin/bun dev          # watch mode (localhost:3000)
~/.bun/bin/bun run build    # production build — must pass clean before deploy
~/.bun/bin/bun run lint     # ESLint

# No test runner is configured.
```

Always verify `bun run build` passes (0 errors, 0 TS issues) after any significant change.

---

## Repository Role

`medialane-portal` is the **developer portal** for Medialane at `portal.medialane.io`.
It is a Next.js 15 App Router site — API key management, usage dashboard, webhooks, and full REST + SDK documentation.

**Do not confuse it with:**
- `medialane-io` — consumer launchpad at `www.medialane.io` (ChipiPay invisible wallet)
- `medialane-dapp` — permissionless dApp at `dapp.medialane.io` (on-chain reads, Starknet wallets)
- `medialane-backend` — the Hono REST API + indexer service
- `medialane-sdk` — the TypeScript SDK (`@medialane/sdk` npm package, v0.5.3)

**Only email in use across the entire platform**: `dao@medialane.org`

**Build note**: `✓ Compiled successfully` is the success indicator. Static generation fails locally due to missing `NEXT_PUBLIC_CHIPI_API_KEY` — this is expected and pre-existing.

---

## Site Map

| Route | Purpose | Touch? |
|---|---|---|
| `/` | Hero + feature chips + mini pricing teaser + events | Yes |
| `/features` | API surface, AI agents, webhooks | Yes |
| `/pricing` | FREE vs PREMIUM table | Yes |
| `/connect` | Community links + contact form | Yes |
| `/docs` | Getting started guide | Yes |
| `/docs/api` | Full REST endpoint reference | Yes |
| `/docs/sdk` | @medialane/sdk quickstart | Yes |
| `/changelog` | Static release timeline | Yes |
| `/terms` | Placeholder TOS | Yes |
| `/privacy` | Placeholder privacy policy | Yes |
| `/account` | API portal dashboard (Clerk auth + ChipiPay wallet) | Yes |
| `/onboarding` | Wallet setup — passkey-first, PIN fallback | Yes |
| `/mint` | NFT mint page | **DO NOT TOUCH** |
| `/workshop` | Workshop event page | **DO NOT TOUCH** |

---

## Architecture

### Server vs Client Components

Next.js 15 App Router defaults everything to **server components**.
Only add `"use client"` when a component uses hooks, browser APIs, or event listeners.

Current client components (must have `"use client"`):
- `src/components/floating-nav.tsx` — uses `useState`, `usePathname`, framer-motion
- `src/components/logo-medialane.tsx` — uses `useMobile()` hook
- `src/components/docs/sidebar.tsx` — uses `usePathname`
- `src/app/connect/page.tsx` — contact form state

Current server components (no `"use client"`):
- `src/components/footer.tsx`
- `src/components/background-gradients.tsx`
- `src/components/docs/typography.tsx`
- All static page files (`/features`, `/pricing`, `/docs`, `/changelog`, etc.)

**Rule**: If a component renders a hook-using child, the child must own `"use client"` — not the parent. The `logo-medialane.tsx` bug (missing `"use client"`) was a real example of this.

### Layout hierarchy

```
src/app/layout.tsx          ← Root layout: ClerkProvider + FloatingNav + Footer
  src/app/docs/layout.tsx   ← Docs layout: 2-col (DocsSidebar + content)
    src/app/docs/page.tsx   ← Getting started
    src/app/docs/api/page.tsx
    src/app/docs/sdk/page.tsx
```

Footer is rendered in root layout — visible on all pages except those that override it (mint/workshop use their own layouts).

---

## Key Shared Components

| Component | Path | Purpose |
|---|---|---|
| `BackgroundGradients` | `src/components/background-gradients.tsx` | Fixed purple/cyan gradient blobs — import on full-page routes |
| `DocH2` / `DocH3` / `DocCodeBlock` | `src/components/docs/typography.tsx` | Consistent heading/code styling in docs + legal pages |
| `DocsSidebar` | `src/components/docs/sidebar.tsx` | Sticky left nav for `/docs/*` routes |
| `FloatingNav` | `src/components/floating-nav.tsx` | Top navigation — logo, nav links, account button. **Fixed position, ~70px tall.** |
| `Footer` | `src/components/footer.tsx` | 3-column footer + social row |
| `LogoMedialane` | `src/components/logo-medialane.tsx` | Responsive logo (different sizes mobile/desktop) |
| `WalletPinDialog` | `src/components/chipi/wallet-pin-dialog.tsx` | Transaction auth — passkey-first, PIN fallback |
| `WalletSummary` | `src/components/chipi/wallet-summary.tsx` | Balance display + receive dialog |

### Adding a new page

1. Does it need the full-bleed background? → `import { BackgroundGradients } from "@/src/components/background-gradients"`
2. Is it a doc-style page? → Use `DocH2`, `DocH3`, `DocCodeBlock` from `@/src/components/docs/typography`
3. Is it inside `/docs`? → It automatically gets the sidebar via `src/app/docs/layout.tsx`

---

## Contact Form (SMTP)

`src/app/connect/page.tsx` → POST `src/app/api/contact/route.ts` → `src/lib/mailer.ts`

Env vars required (fill from medialane-dapp `.env`):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=dao@medialane.org
SMTP_PASS=                     # from medialane-dapp .env
CONTACT_TO_EMAIL=dao@medialane.org
CONTACT_FROM_EMAIL=dao@medialane.org
```

The contact route uses Zod for validation. Honeypot field `_hp` blocks bot submissions.

---

## Design Conventions

- **Dark theme only** — all pages use a dark background, `text-white` / `text-muted-foreground`
- **Glass nav** — `.glass-effect` in `src/app/globals.css` (blur + dark bg/60)
- **Tailwind** — utility-first, no CSS modules. `cn()` from `src/lib/utils.ts` for conditional classes
- **Radix UI** — used for interactive primitives (Collapsible in sidebar, etc.)
- **Framer Motion** — used only in `floating-nav.tsx` for mobile menu animation
- **No custom fonts beyond Next.js defaults** — standard system font stack

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun (`~/.bun/bin/bun`) |
| UI | React 19 + Tailwind v3 + Radix UI |
| Animation | Framer Motion |
| Auth | Clerk 6 (`@clerk/nextjs`) — auth + user metadata storage |
| Wallet | ChipiPay — `@chipi-stack/nextjs` v14 + `@chipi-stack/chipi-passkey` |
| Email | nodemailer v8 (SMTP, contact form only) |
| Validation | Zod v3 (contact API route) |
| Path alias | `@/*` → repo root, `@/src/*` → `src/` |

---

## Common Pitfalls

- **`"use client"` missing on hook-using components** — causes build errors when the component tree is server-rendered. Add it at the component that owns the hook, not at the parent.
- **macOS `sed` backreferences** — BSD sed doesn't support `\1`/`\2` in replacement with `-i`. Use Python3 or the Edit tool instead.
- **`bun` not in PATH** — always use `~/.bun/bin/bun` explicitly or the Bash tool with full path.
- **Footer not rendered** — confirm `<Footer />` is uncommented in `src/app/layout.tsx`.
- **FloatingNav overlay** — the nav is `position: fixed` and ~70px tall. Pages must use `pt-28` (112px) as their top padding. Other values (e.g. `pt-12`) will cause content to hide behind the nav. See `/features`, `/account` for the correct pattern.
- **Clerk JWT staleness** — after updating `publicMetadata`, call `user.reload()` then `session.touch()` before navigating, otherwise middleware may still read stale JWT claims. The middleware also has a Clerk API fallback for resilience.
- **ChipiPay template** — `getToken({ template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME })` is used throughout. The Clerk dashboard must have a JWT template named accordingly. The middleware also needs `{ "metadata": "{{user.public_metadata}}" }` in the session token to avoid API fallback calls on every request.
