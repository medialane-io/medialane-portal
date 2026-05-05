# Content & Messaging Refresh — Design Spec

**Goal:** Rewrite the portal's content and structure to honestly reflect what Medialane is — a capital market for creative work — and what the portal gives developers: API and SDK access to that market.

**Audience:** Developers and builders first. The copy speaks plainly about what can be built, not about the underlying chain or asset type.

**Tone:** Direct and honest. No buzzwords. No "revolutionizing", "next-gen", "permissionless IP infrastructure". State what it is and what you get.

**Source of truth:** `medialane-docs` about page, apps page, and learn sections. All messaging must be consistent with those documents.

---

## What Medialane Is (internal anchor — every page derives from this)

Medialane is a capital market for creative work. Creators, collectors, AI agents, and organizations mint, license, trade, and earn from programmable assets — IP, RWAs, NFTs — on-chain. The Medialane Portal is the developer layer: REST API, TypeScript SDK, webhooks, and pay-as-you-go credits to build on top of the platform.

The platform is built on Mediolano — an independent, permissionless public goods protocol — and settles on Starknet. These are infrastructure facts, not the pitch.

---

## Pages in Scope

### 1. Homepage (`/`)

**What changes:**
- Hero headline: replace "Build on Starknet IP" with a plain statement of what Medialane is
- Hero subhead: one sentence describing what the portal gives developers, without chain or asset-type jargon
- Feature chips: replace API-surface labels with outcome-oriented descriptions
- Cards row: remove the dead Workshop card; replace with a card pointing to the AI agents guide (`/docs/agents`)
- Fix hero CTA: `/sign-in` button → opens wallet connect modal (already done in code; copy update needed)
- Pricing teaser: keep structure, no copy changes needed

**New hero headline:**
> Creator Capital Markets

**New hero badge:**
> The monetization platform for creators, collectors, and AI agents

**New hero subhead:**
> Medialane is where creative work becomes programmable capital. The portal gives developers API and SDK access to the full ecosystem — assets, orders, licensing, drops, credentials, and real-time events.

**New feature chips (replacing old ones):**
- Revenue Flows → royalties, licensing, primary sales
- Programmable Licensing → remix, derivatives, open licenses
- Collection Drops → fixed-supply public minting campaigns
- POP Credentials → event-based soulbound tokens
- AI Agent Access → autonomous auth, 402 billing, open-license detection
- Webhooks → real-time on-chain events pushed to your endpoint

**Cards row:**
- Keep: "Headless Auth for Agents" → `/docs/agents`
- Replace Workshop card with: "Launchpad Services" → brief description of POP Protocol, Collection Drop, Remix — links to `/docs/sdk`

**Code preview:** keep the terminal block but change the endpoint shown to something that better illustrates the platform (e.g. a collection listing or a portfolio query, not raw token metadata).

---

### 2. Features (`/features`)

**What changes:**
- Page headline: replace "Everything you need to build on Starknet IP" and "One REST API. All the data. No indexer needed."
- Reframe each feature card title/description from "what the endpoint does" to "what you can build with it"
- Move the AI Agents section to the top — it's the strongest differentiator
- Webhooks section: stays as-is, minor copy tightening

**New page headline:**
> Build on Creator Capital Markets

**New page subhead:**
> The Medialane API covers the full platform surface. Marketplace orders, IP assets, minting, licensing, drops, credentials, comments, and real-time events — one key, one SDK.

**Feature card rewrites (key ones):**

| Old title | New title | New description |
|---|---|---|
| Orders & Listings | Marketplace Orders | Query active listings, bids, and completed sales. Filter by contract, token, or wallet. |
| Collections | Collections & Drops | Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources. |
| Minting & Launchpad | Launch & Mint | Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment. |
| Tokens & Metadata | Asset Metadata | Resolve full metadata for any token, including license terms, remix history, and provenance. |
| Activities | On-chain Activity | Stream every event: mints, transfers, sales, offers, cancellations — indexed in real time. |
| Intents (SNIP-12) | Trade Intents | Create and sign structured trade intents using SNIP-12. Submit orders without exposing private keys. |
| Health & Monitoring | Platform Status | Real-time indexer and database health. Build reliable integrations with observable system state. |
| Search | Search | Full-text search across tokens, collections, and creators. |
| On-chain Comments | On-chain Comments | No change needed — description is already clear. |
| Remix Licensing | Remix Licensing | No change needed. |
| Counter-offers | Counter-offers | No change needed. |
| POP Protocol | POP Protocol | No change needed. |
| Collection Drop | Collection Drop | No change needed. |

**AI Agents section — move to top, keep copy, add one line:**
> Agents receive a `402 Payment Required` response when credits run out and can trigger autonomous top-up via the USDC deposit flow.

---

### 3. Pricing (`/pricing`)

**What changes:** minimal — the pricing page is already the plainest on the site.

- Remove any reference to "PREMIUM" — there is no PREMIUM tier, only free + pay-as-you-go
- Change hero subhead to match the new tone:

**Current:** "Pay only for what you use"
**New:** "50 free credits every month. Top up with USDC. Hold MDLN for up to 2× more credits per dollar."

(Move the current subhead text into the body — it's more description than headline.)

---

### 4. Docs stub (`/docs`)

**What changes:** significant restructure. The portal `/docs` page stops being a full getting-started guide and becomes a focused reference for portal-specific topics, with links out to medialane-docs for everything else.

**New structure:**

**Section 1 — Portal essentials (stays on this page):**
- Authentication: how to get an API key, `x-api-key` header usage
- Base URL and versioning
- Credits and billing: free tier, USDC top-up, 402 handling, MDLN multipliers
- Error codes table

**Section 2 — Go deeper (links to medialane-docs.io):**
- Full API reference → `docs.medialane.io/docs/api-docs`
- SDK documentation → `docs.medialane.io/docs/sdk`
- Protocol spec → `docs.medialane.io/docs/protocol`
- Smart contracts → `docs.medialane.io/docs/contracts`
- Developer guides → `docs.medialane.io/docs/developers`
- Security → `docs.medialane.io/docs/security`

**Section 3 — New: AI agents quickstart (teaser, full content on `/docs/agents`):**
- One paragraph, link to the full agents page

**Remove from `/docs`:**
- The three-step quick start (replaced by the new clean structure)
- The "Platform Surfaces" section (redundant with homepage)
- The long SDK installation block (belongs on medialane-docs)

---

### 5. New page: `/docs/agents`

A standalone guide for developers building AI agent integrations.

**Sections:**

**1 — What agents can do on Medialane**
Plain list: authenticate headlessly, provision credits, query assets and orders, detect open-license content, submit trade intents, respond to 402 by topping up.

**2 — Authentication**
Headless SIWS flow: generate challenge → sign with agent keypair → POST to verify → receive JWT cookie. Code example in TypeScript using `starknet.js`.

**3 — Handling 402 Payment Required**
When credits run out, the API returns 402 with `X-Credits-Remaining: 0`. Agents can detect this and programmatically trigger a USDC deposit via the Starknet transfer flow. Code example.

**4 — Querying open-license assets**
How to detect CC0 and other open-license assets suitable for autonomous remix. Use `OPEN_LICENSES` from `@medialane/sdk`. Code example.

**5 — Submitting trade intents**
How an agent signs a listing or fulfillment intent using its keypair. Code example using `client.api.createListingIntent` + `toSignatureArray`.

**6 — SDK reference links**
Links to relevant SDK methods, error codes, medialane-docs.

---

### 6. `/docs/sdk` (portal page)

**What changes:** this page becomes a thin entry point, not a full SDK reference.

Replace current content with:
- Install command
- Client initialization (3-4 lines)
- 4 bullet points on what the SDK covers (Assets, Marketplace, Collections, Portfolio)
- Link to full SDK docs on medialane-docs.io
- Link to `/docs/agents` for AI agent usage

The full SDK documentation lives on medialane-docs.io — the portal page just gets developers started and points them there.

---

## What Does NOT Change

- Site structure and routing (same pages, same URLs)
- Dark theme, visual design, component library
- Pricing model numbers (50 free credits, $0.01/credit, MDLN tiers)
- Auth flow (wallet connect modal, SIWS)
- Footer links (already cleaned up)

---

## Out of Scope for This Phase

- Full docs migration (deeper medialane-docs integration beyond linking)
- Changelog page content
- Connect page
- Terms / Privacy
- SDK API docs page (full rewrite — separate phase)

---

## Self-Review

**Placeholder scan:** No TBD or TODO. All section copy is specified. ✓

**Internal consistency:**
- "Creator Capital Markets" is the headline on homepage. The phrase does not appear on other pages — it doesn't need to, each page has its own plain header. Consistent with medialane-docs about page. ✓
- Mediolano is mentioned as infrastructure context, not product. Consistent with medialane-docs philosophy. ✓
- `/sign-in` references removed from copy (page already deleted). ✓
- "PREMIUM" tier removed from pricing — consistent with actual billing model. ✓

**Scope check:** This is a content/copy spec, not a full redesign. All changes are text and structure within existing components. Implementable in a single plan. ✓

**Ambiguity check:**
- "Links to medialane-docs.io" — assumes docs.medialane.io is live and has the referenced pages. If not live, links should point to the GitHub repo pages instead. Implementable either way, implementer should verify the URL before wiring. ✓
