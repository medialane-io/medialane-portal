# Content & Messaging Refresh — Design Spec

**Goal:** Rewrite the portal's content to honestly reflect what Medialane is — a capital market for creative work — and what the portal gives developers: API and SDK access to that market. Expand and improve all documentation. Reframe the access model around MDLN token gating and variable-cost credits.

**Audience:** Developers, builders, and AI agents. The copy speaks plainly about what can be built.

**Tone:** Direct and honest. No buzzwords. No "revolutionizing", "next-gen", "permissionless IP infrastructure". State what it is and what you get.

**Source of truth:** The platform itself — what it does, what the API exposes, what the SDK covers.

---

## What Medialane Is (internal anchor — every page derives from this)

Medialane is a capital market for creative work. Creators, collectors, AI agents, and organizations mint, license, trade, and earn from programmable assets — IP, RWAs, NFTs — on-chain. The Medialane Portal is the developer layer: REST API, TypeScript SDK, webhooks, and a credit-based billing system to build on top of the platform.

The platform settles on Starknet via Mediolano, an independent public goods protocol. These are infrastructure facts, not the pitch.

**Consumer apps built on the SDK (use as showcase examples throughout):**
- `medialane.io` — the creator launchpad (minting, drops, portfolio)
- `dapp.medialane.io` — the permissionless on-chain dApp (marketplace, licensing, trading)

---

## Access Model

### MDLN Token Gate
Access to any API key requires a minimum wallet balance of **500 MDLN**. This is a spam/abuse gate, not a fee — the tokens remain in the user's wallet.

| MDLN Balance | Credit Multiplier |
|---|---|
| 500 – 999 | 1.0× (base) |
| 1,000 – 1,999 | 1.2× |
| 2,000 – 4,999 | 1.5× |
| 5,000+ | 2.0× |

### Credit System
Credits are topped up with USDC. No published credit-to-USDC rate — pricing is determined at deployment time and communicated in-app.

**Variable credit costs by endpoint category:**
| Category | Credits | Examples |
|---|---|---|
| Read / query | 1 | Get asset, list collections, search, activity |
| Trade intents (SNIP-12) | 5 | Create listing, fulfill order, counter-offer |
| Minting | 10 | Mint token, batch mint |
| Launchpad / deploy | 100 | Deploy collection contract, Collection Drop, POP Protocol |

### 402 Handling
When credits run out the API returns `402 Payment Required` with `X-Credits-Remaining: 0`. Agents can detect this and programmatically trigger USDC top-up.

---

## Pages in Scope

### 1. Homepage (`/`)

**What changes:**
- Hero headline: "Creator Capital Markets"
- Hero badge: "The monetization platform for creators, collectors, and AI agents"
- Hero subhead: plain statement of what the portal gives developers
- Feature chips: outcome-oriented (not API-surface labels)
- Cards row: replace Workshop card with Integrate card; keep AI agents card
- Fix any remaining `/sign-in` copy references → wallet connect modal
- Code preview: change example endpoint to something illustrative (collection listing or portfolio query)

**New hero headline:**
> Creator Capital Markets

**New hero badge:**
> The monetization platform for creators, collectors, and AI agents

**New hero subhead:**
> Medialane is where creative work becomes programmable capital. The portal gives developers API and SDK access to the full ecosystem — assets, orders, licensing, drops, credentials, and real-time events.

**New feature chips:**
- Revenue Flows → royalties, licensing, primary sales
- Programmable Licensing → remix, derivatives, open licenses
- Collection Drops → fixed-supply public minting campaigns
- POP Credentials → event-based soulbound tokens
- AI Agent Access → autonomous auth, 402 billing, open-license detection
- Webhooks → real-time on-chain events pushed to your endpoint

**Cards row:**
- Keep: "Headless Auth for Agents" → `/docs/agents`
- Replace Workshop card with: "Integrate the API" → description of access model and SDK, links to `/integrate`

**Code preview:** endpoint showing a collection listing or portfolio query, not raw token metadata.

---

### 2. Features (`/features`)

**What changes:**
- Page headline: "Build on Creator Capital Markets"
- Page subhead: one sentence covering the full API surface
- Move AI Agents section to the top (strongest differentiator)
- Reframe each feature card from "what the endpoint does" to "what you can build"
- Add use case examples referencing medialane.io and dapp.medialane.io as consumer apps

**New page headline:**
> Build on Creator Capital Markets

**New page subhead:**
> The Medialane API covers the full platform surface. Marketplace orders, IP assets, minting, licensing, drops, credentials, comments, and real-time events — one key, one SDK.

**Feature card rewrites:**

| Old title | New title | New description |
|---|---|---|
| Orders & Listings | Marketplace Orders | Query active listings, bids, and completed sales. Filter by contract, token, or wallet. medialane.io marketplace runs on this. |
| Collections | Collections & Drops | Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources. |
| Minting & Launchpad | Launch & Mint | Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment. |
| Tokens & Metadata | Asset Metadata | Resolve full metadata for any token, including license terms, remix history, and provenance. |
| Activities | On-chain Activity | Stream every event: mints, transfers, sales, offers, cancellations — indexed in real time. |
| Intents (SNIP-12) | Trade Intents | Create and sign structured trade intents using SNIP-12. Submit orders without exposing private keys. |
| Health & Monitoring | Platform Status | Real-time indexer and database health. Build reliable integrations with observable system state. |
| Search | Search | Full-text search across tokens, collections, and creators. |
| Remix Licensing | Remix Licensing | Detect and enforce remix terms. Query open-license content suitable for autonomous reuse. |
| POP Protocol | POP Protocol | Issue soulbound credentials tied to on-chain or off-chain events. |
| Collection Drop | Collection Drop | Launch fixed-supply public minting campaigns with configurable windows and caps. |

**AI Agents section — move to top, update with 402 note:**
> Agents authenticate headlessly via SIWS, receive a `402 Payment Required` response when credits run out, and can trigger autonomous top-up via the USDC deposit flow.

---

### 3. `/pricing` → `/integrate`

**Route change:** rename from `/pricing` to `/integrate`. Add redirect from `/pricing` to `/integrate`.

**What changes — major reframe:**
- Page is no longer a cost comparison table
- Page tells the integration story: how to get access, how credits work, what the tiers unlock
- No published credit-to-USDC rate (rate is dynamic)
- Remove any "PREMIUM" tier label

**New page headline:**
> Start Building

**New structure:**

**Section 1 — Access (MDLN Gate)**
- To get an API key you need 500 MDLN in your wallet
- Tokens stay in your wallet — this is a balance check, not a fee
- MDLN tiers and credit multipliers (table above)
- MDLN on Starknet: where to get it (link to medialane.io)

**Section 2 — Credits**
- Credits are the billing unit
- Top up with USDC at any time from your dashboard
- Credits never expire
- Variable costs per category (table above)
- 402 response when credits hit zero

**Section 3 — What you get**
- REST API (one key)
- TypeScript SDK (`@medialane/sdk`)
- Webhooks
- Dashboard: usage, history, key management
- Links to `/docs` and `/docs/sdk`

**Section 4 — Consumer app examples**
- medialane.io — built entirely on the SDK; source of truth for what the API can do
- dapp.medialane.io — on-chain trading and licensing, Starknet wallet native

---

### 4. Docs (`/docs`)

**What changes:** Content stays and expands. This is the primary developer reference for portal-specific topics. No reduction, no outsourcing.

**Improved structure:**

**Section 1 — Authentication**
- How to connect wallet and get an API key
- MDLN balance requirement (500 minimum)
- `x-api-key` header usage
- Base URL and versioning

**Section 2 — Credits & Billing**
- Free monthly credits (if applicable) vs. USDC top-up
- Variable credit costs per endpoint category (full table)
- 402 handling: what happens when credits run out
- MDLN multiplier tiers

**Section 3 — API Reference**
- Full endpoint reference (keep existing, expand)
- Request / response examples for each major category
- Error codes table

**Section 4 — Use Cases & Examples**
- Showcase: how medialane.io uses the API (marketplace, portfolio, minting)
- Showcase: how dapp.medialane.io uses the API (on-chain reads, trade intents)
- Code examples for common patterns: fetch a portfolio, submit a listing intent, stream activity events

**Section 5 — AI Agents (teaser)**
- One paragraph on agent auth and 402 handling
- Link to `/docs/agents`

**Section 6 — SDK Quick Start**
- Install + initialize (4 lines)
- Link to `/docs/sdk`

**Section 7 — Go deeper (external links)**
- Full SDK docs: `docs.medialane.io/docs/sdk`
- Protocol spec: `docs.medialane.io/docs/protocol`
- Smart contracts: `docs.medialane.io/docs/contracts`

---

### 5. New page: `/docs/agents`

A standalone guide for developers building AI agent integrations.

**Sections:**

**1 — What agents can do on Medialane**
- Authenticate headlessly (SIWS)
- Provision and manage credits
- Query assets, orders, collections
- Detect open-license content for autonomous remix
- Submit trade intents
- Handle 402 autonomously

**2 — Authentication**
SIWS flow: generate challenge → sign with agent keypair → POST to verify → receive JWT cookie. TypeScript code example using `starknet.js`.

**3 — Handling 402 Payment Required**
When credits hit zero: `402` response + `X-Credits-Remaining: 0`. TypeScript code example showing detection + USDC deposit trigger.

**4 — Querying open-license assets**
How to detect CC0 and open-license assets. Use `OPEN_LICENSES` from `@medialane/sdk`. Code example.

**5 — Submitting trade intents**
How an agent signs a listing or fulfillment intent using its keypair. Code example using `client.api.createListingIntent` + `toSignatureArray`.

**6 — SDK reference links**
Links to SDK methods, error codes, medialane-docs.

---

### 6. `/docs/sdk`

**What changes:** Keep rich, add use cases. Not a thin stub — a real quick start.

**Content:**
- Install command
- Client initialization (4–6 lines)
- What the SDK covers: Assets, Marketplace, Collections, Portfolio, Licensing, Drops, Credentials
- Use case examples:
  - Fetch a creator's portfolio
  - List open-license assets
  - Submit a trade intent
  - Stream on-chain activity
- Consumer app examples: medialane.io and dapp.medialane.io
- Links to full SDK docs on medialane-docs.io

---

## What Does NOT Change

- Site structure (same URLs except `/pricing` → `/integrate`)
- Dark theme, visual design, component library
- Auth flow (wallet connect modal, SIWS)
- Footer links
- Any `/docs/api` endpoint reference content (keep and expand, don't remove)

---

## Out of Scope

- Changelog page content
- Connect page
- Terms / Privacy
- MDLN gate enforcement in backend (separate backend task)
- Credit variable pricing enforcement in API (separate backend task)
- Consumer app fees for medialane.io (future roadmap)

---

## Self-Review

**Placeholder scan:** No TBD or TODO. All section copy is specified. ✓

**Internal consistency:**
- "Creator Capital Markets" is the homepage headline. No other page repeats it as a headline — each page has its own plain header. ✓
- MDLN gate described consistently: 500 minimum, tokens stay in wallet, it's a balance check. ✓
- No published credit-to-USDC rate anywhere in the spec. ✓
- `/pricing` → `/integrate` rename applied everywhere in scope. ✓
- Workshop card replaced on homepage. ✓
- No `/sign-in` references in copy. ✓
- Docs expanded not reduced. ✓
- Use cases referencing medialane.io and dapp.medialane.io included in docs and features. ✓

**Scope check:** Content and copy changes within existing components + new `/docs/agents` page + route rename. Single implementation plan. ✓

**Ambiguity check:**
- `/docs/agents` is a new page — needs to be added to DocsLayout sidebar. ✓ (noted in plan)
- `/pricing` redirect to `/integrate` — Next.js redirect in `next.config.ts`. ✓
- MDLN balance check at API key provisioning time — portal already reads `mdln_tier` from accounts table; the gate threshold check is a portal-side guard on the provision endpoint. ✓
