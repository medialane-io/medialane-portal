<img width="2972" height="2160" alt="Medialane — Developer Portal for Programmable IP on Starknet" src="https://github.com/user-attachments/assets/abd42bec-d6b9-4636-a9cf-21fe8ec3ba0d" />

# Medialane Developer Portal

**Developer Portal for Programmable IP on Starknet — [portal.medialane.io](https://portal.medialane.io)**

[portal.medialane.io](https://portal.medialane.io) is the developer-facing gateway to the Medialane platform — API access, SDK documentation, API key management, webhooks, and usage analytics.

Everything you need to build Programmable IP on Starknet. One REST API. All the data. No indexer needed.

---

## What is Medialane?

Medialane is infrastructure for the **creative economy on Starknet**. It enables creators, businesses, and AI agents to own, license, and trade intellectual property as NFTs — with programmable licensing terms embedded immutably in IPFS metadata, compliant with the Berne Convention.

The platform operates through two integrated products:

- **[Medialane.io](https://medialane.io)** — Consumer marketplace and creator launchpad. Mint IP assets, trade NFTs, manage collections. No wallet required — gasless transactions via ChipiPay.
- **[portal.medialane.io](https://portal.medialane.io)** — Developer portal. API keys, REST endpoint docs, SDK quickstart, webhooks, usage analytics.

Both are powered by the Medialane backend (Starknet indexer + Hono REST API) and the `@medialane/sdk` TypeScript package.

---

## Features

### For Developers
- **REST API access** — Query orders, tokens, collections, activities, search. One API key, all the data.
- **API key management** — Create, view, and revoke keys from the `/account` dashboard
- **Webhooks** — Subscribe to `ORDER_CREATED`, `ORDER_FULFILLED`, `ORDER_CANCELLED`, `TRANSFER` events (PREMIUM)
- **Usage analytics** — 30-day request history by day
- **SDK documentation** — `@medialane/sdk` quickstart, full method reference
- **Full API reference** — Every endpoint, parameter, and response shape documented at `/docs/api`
- **Agent quickstart** — SIWS auth flow, credit top-up, autonomous agent patterns at `/docs/agents`

### For Creators
- **Starknet wallet auth** — Sign in with Starknet (SIWS) — no password, no Clerk, no custodial key
- **Credit system** — Pay-as-you-go credits, MDLN token multipliers (up to 2×)
- **Contact form** — Reach the team at `/connect`

### Platform
- **Pricing** — FREE tier + pay-as-you-go credits with MDLN multipliers
- **Changelog** — Release timeline at `/changelog`
- **Dark-theme UI** — Glass navigation, gradient backgrounds, Framer Motion animations

---

## API Overview

The Medialane REST API indexes Starknet in real time and exposes structured data for any dApp or agent.

| Category | What you get |
|---|---|
| **Orders & Listings** | Open orders, bids, fulfilled listings. Filter by NFT, collection, user, currency, price. |
| **Tokens & Metadata** | On-chain + IPFS metadata for any token. Upload and pin your own metadata. |
| **Collections** | Floor price, total volume, holder count, token inventory for any collection. |
| **Activities** | Mints, transfers, sales, offers, cancellations — indexed in real time. |
| **Intents (SNIP-12)** | Create, sign, and submit structured trade intents using the SNIP-12 typed data standard. |
| **Search** | Full-text search across tokens, collections, and creators. |
| **Portal** | API keys, webhooks, usage — self-service from `/account`. |

Get your API key at [portal.medialane.io/account](https://portal.medialane.io/account). Full reference at [portal.medialane.io/docs/api](https://portal.medialane.io/docs/api).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| UI | React 19 + [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Auth | SIWS — Sign In With Starknet (stateless, JWT cookie) |
| Database | PostgreSQL (Neon) — accounts, sessions, credits, deposits |
| Email | nodemailer v8 (SMTP — contact form) |
| Validation | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| SDK | [@medialane/sdk](https://www.npmjs.com/package/@medialane/sdk) |

---

## Site Map

| Route | Description |
|---|---|
| `/` | Hero, feature overview, pricing teaser, ecosystem links |
| `/features` | API surface, AI agent support, webhooks, real-time indexing |
| `/pricing` | FREE tier + pay-as-you-go + MDLN multiplier table |
| `/connect` | Community links + contact form (SMTP) |
| `/docs` | Getting started guide |
| `/docs/api` | Full REST endpoint reference |
| `/docs/sdk` | `@medialane/sdk` quickstart and method reference |
| `/docs/agents` | AI agent quickstart — SIWS auth, 402 handling, autonomous top-up |
| `/changelog` | Release timeline |
| `/account` | API portal dashboard (API keys, webhooks, usage) — SIWS auth required |
| `/sign-in` | Wallet connect + SIWS sign-in |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

---

## Getting Started (Local Development)

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Setup

```bash
# Clone
git clone https://github.com/medialane-io/medialane-portal.git
cd medialane-portal

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Fill in required values (see below)

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
bun dev          # Development server (localhost:3000)
bun run build    # Production build — must pass clean before deploy
bun lint         # ESLint
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing session JWT cookies |
| `NEXT_PUBLIC_MEDIALANE_BACKEND_URL` | Yes | Medialane API base URL |
| `NEXT_PUBLIC_MEDIALANE_API_KEY` | Yes | Medialane API key (portal calls) |
| `BACKEND_ADMIN_KEY` | Yes | Admin key for backend provisioning |
| `SMTP_HOST` | Contact form | SMTP hostname (e.g. `smtp.hostinger.com`) |
| `SMTP_PORT` | Contact form | SMTP port (e.g. `465`) |
| `SMTP_USER` | Contact form | SMTP username |
| `SMTP_PASS` | Contact form | SMTP password |
| `CONTACT_TO_EMAIL` | Contact form | Recipient address |
| `CONTACT_FROM_EMAIL` | Contact form | Sender address |

---

## Architecture

### Component model

Next.js 15 App Router — server components by default. Client components (`"use client"`) only where hooks or browser APIs are needed.

```
src/app/layout.tsx              ← Root: FloatingNav + Footer
  src/app/(pages)/              ← Marketing pages (server components)
  src/app/docs/layout.tsx       ← Docs: 2-col (DocsSidebar + content)
  src/app/account/              ← Portal dashboard (SIWS auth required)
  src/app/sign-in/              ← Wallet connect + SIWS
```

### Auth flow (SIWS)

1. User connects Starknet wallet on `/sign-in`
2. Portal issues a nonce challenge (`/api/auth/challenge`)
3. User signs the typed-data message with their wallet
4. Portal verifies the signature (`/api/auth/verify`), creates a JWT cookie session
5. Subsequent requests use the JWT cookie — no Clerk, no custodial key

### Key components

| Component | Purpose |
|---|---|
| `FloatingNav` | Fixed top nav (~70px). Pages need `pt-28` top padding. |
| `Footer` | 3-column footer + social links |
| `BackgroundGradients` | Fixed purple/cyan gradient blobs (full-page routes) |
| `DocsSidebar` | Sticky left nav for `/docs/*` |

---

## SDK Quick Example

```bash
npm install @medialane/sdk starknet
```

```typescript
import { MedialaneClient } from "@medialane/sdk";

const client = new MedialaneClient({
  network: "mainnet",
  backendUrl: "https://medialane-backend-production.up.railway.app",
  apiKey: "ml_live_...", // from portal.medialane.io/account
});

// Query active listings
const orders = await client.api.getOrders({ status: "ACTIVE", sort: "recent" });

// Search tokens
const results = await client.api.search("digital art");

// Get token metadata with licensing attributes
const token = await client.api.getToken(contractAddress, tokenId);
console.log(token.data.metadata.licenseType);    // "CC BY-NC-SA"
console.log(token.data.metadata.commercialUse);  // "No"
console.log(token.data.metadata.attributes);     // IpAttribute[]
```

Full reference at [portal.medialane.io/docs/sdk](https://portal.medialane.io/docs/sdk) and on [npm](https://www.npmjs.com/package/@medialane/sdk).

---

## Contributing

Contributions are welcome. If you have a feature or improvement to suggest:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a Pull Request with the `enhancement` tag

---

## Related Repositories

| Repo | Description |
|---|---|
| [medialane-io](https://github.com/medialane-io/medialane-io) | Consumer dApp — creator launchpad + NFT marketplace |
| [medialane-backend](https://github.com/medialane-io/medialane-backend) | Starknet indexer + Hono REST API |
| [@medialane/sdk](https://github.com/medialane-io/sdk) | TypeScript SDK — `npm install @medialane/sdk` |

---

## License

[MIT](LICENSE)

Powered by **Starknet** · **Mediolano Protocol** · **@medialane/sdk**
