# Content & Messaging Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite portal copy and structure to reflect "Creator Capital Markets" positioning, add the `/integrate` page (replacing `/pricing`), expand docs with use cases and variable credit costs, and remove stale Workshop/sign-in references.

**Architecture:** Pure content changes inside existing Next.js 15 App Router page components. No new components needed — all pages use existing UI primitives (`Card`, `Badge`, `Button`, `DocH2`, `DocCodeBlock`). One new route (`/integrate`) is created by adding a new directory. A Next.js redirect sends `/pricing` → `/integrate`. Floating nav label updates.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v3, Bun (`~/.bun/bin/bun`). No test runner — verification is `bun run build`.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/app/page.tsx` | Modify | Hero, chips, code preview, pricing teaser, Workshop→Integrate card |
| `src/app/features/page.tsx` | Modify | Headline, AI agents to top, card rewrites, remove PREMIUM badge |
| `src/app/pricing/page.tsx` | Delete content → redirect only | Replaced by `/integrate` |
| `src/app/integrate/page.tsx` | Create | New integration story page |
| `src/app/docs/page.tsx` | Modify | Fix sign-in link, update credits section, add use cases |
| `src/app/docs/sdk/page.tsx` | Modify | Add use case examples section |
| `src/app/docs/agents/page.tsx` | Modify | Add MDLN gate context, verify completeness |
| `src/components/floating-nav.tsx` | Modify | "Pricing" → "Integrate", href `/pricing` → `/integrate` |
| `src/app/sitemap.ts` | Modify | `/pricing` → `/integrate` |
| `next.config.ts` | Modify | Add redirect `/pricing` → `/integrate` |

---

## Task 1: Homepage — Hero, Chips, Code Preview

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update the hero badge, headline, and subhead**

Replace the top of the `Home` component's hero section. The full updated `page.tsx` imports and hero section:

```tsx
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Code2, Key, BarChart2, ArrowRight, Sparkles, Bot, Check,
  GitFork, MessageSquare, Coins, Ticket, ShoppingBag,
} from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"
```

In the hero `<section>`:

Replace:
```tsx
<Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
  <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
  Permissionless IP Infrastructure on Starknet
</Badge>

<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
  Build on Starknet IP
</h1>

<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
  Mint, query and monetize IP assets on Starknet. Connect your wallet and integrate in minutes —
  fully permissionless for humans and AI agents alike.
</p>
```

With:
```tsx
<Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
  <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
  The monetization platform for creators, collectors, and AI agents
</Badge>

<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
  Creator Capital Markets
</h1>

<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
  Medialane is where creative work becomes programmable capital. The portal gives developers
  API and SDK access to the full ecosystem — assets, orders, licensing, drops, credentials,
  and real-time events.
</p>
```

- [ ] **Step 2: Fix the primary CTA button (remove /sign-in)**

Replace:
```tsx
<Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
  <Link href="/sign-in">
    <Key className="w-5 h-5 mr-2" />
    Connect Wallet &amp; Build
  </Link>
</Button>
```

With:
```tsx
<Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
  <Link href="/account">
    <Key className="w-5 h-5 mr-2" />
    Get API Access
  </Link>
</Button>
```

- [ ] **Step 3: Replace feature chips**

Replace the chips array:
```tsx
{[
  { icon: Code2, label: "IP Metadata" },
  { icon: BarChart2, label: "Collections & Stats" },
  { icon: GitFork, label: "Remix Licensing" },
  { icon: MessageSquare, label: "On-chain Comments" },
  { icon: Bot, label: "Agent-Native Access" },
  { icon: Coins, label: "MDLN Token Benefits" },
].map(({ icon: Icon, label }) => (
```

With:
```tsx
{[
  { icon: Coins, label: "Revenue Flows" },
  { icon: GitFork, label: "Programmable Licensing" },
  { icon: ShoppingBag, label: "Collection Drops" },
  { icon: Ticket, label: "POP Credentials" },
  { icon: Bot, label: "AI Agent Access" },
  { icon: Code2, label: "Webhooks" },
].map(({ icon: Icon, label }) => (
```

- [ ] **Step 4: Replace the code preview**

Replace the `SAMPLE_RESPONSE` constant and the terminal block title. First, update the constant at the top of the file:

Replace:
```tsx
const SAMPLE_RESPONSE = `{
  "data": {
    "tokenId": "42",
    "name": "Sonic Bloom #42",
    "description": "Generative audio-visual IP on Starknet.",
    "image": "ipfs://bafybe.../42.png",
    "ipType": "Audio",
    "licenseType": "CC BY",
    "attributes": [
      { "trait_type": "IP Type",      "value": "Audio" },
      { "trait_type": "License Type", "value": "CC BY" },
      { "trait_type": "BPM",          "value": "128" },
      { "trait_type": "Creator",      "value": "0x05f9..." }
    ],
    "remixCount": 3,
    "commentCount": 11
  }
}`
```

With:
```tsx
const SAMPLE_RESPONSE = `{
  "data": [
    {
      "contractAddress": "0x04a...",
      "name": "Sonic Bloom",
      "floorPrice": "0.05",
      "volume24h": "1.2",
      "itemsCount": 512,
      "ownersCount": 314,
      "licenseType": "CC BY",
      "source": "collection_drop"
    }
  ],
  "meta": { "total": 48, "page": 1, "limit": 20 }
}`
```

And update the terminal tab label from `GET /v1/tokens/:contract/:tokenId` to:
```tsx
<span className="ml-2 text-xs text-muted-foreground font-mono">GET /v1/collections</span>
```

- [ ] **Step 5: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` (or static generation warnings — those are pre-existing and expected from CLAUDE.md).

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "content: homepage hero, chips, code preview refresh"
```

---

## Task 2: Homepage — Pricing Teaser & Workshop Card

**Files:**
- Modify: `src/app/page.tsx` (pricing teaser section + cards row section)

- [ ] **Step 1: Replace the pricing teaser section**

Replace the entire "Pricing teaser" `<section>` (lines 99–144 in original, between `{/* Pricing teaser */}` and the cards row comment):

```tsx
{/* Integrate teaser */}
<section className="container mx-auto px-4 pb-16 max-w-5xl">
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">MDLN Access</h3>
          <span className="text-sm font-semibold text-muted-foreground">500 MDLN min</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Hold 500 MDLN in your wallet to get an API key. Tokens stay in your wallet — it&apos;s a balance check, not a fee.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "All API endpoints",
            "Up to 5 API keys",
            "Portal dashboard",
            "Webhooks included",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href="/account">Connect Wallet</Link>
        </Button>
      </CardContent>
    </Card>

    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">MDLN Multipliers</h3>
          <span className="text-sm font-semibold text-primary">up to 2×</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Top up credits with USDC. Hold more MDLN to get bonus credits automatically at deposit time.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "500 MDLN → 1.0× base",
            "1,000 MDLN → 1.2×",
            "2,000 MDLN → 1.5×",
            "5,000 MDLN → 2.0×",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
          <Link href="/integrate">See integration details</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
</section>
```

- [ ] **Step 2: Replace the Workshop card with an Integrate card**

Replace the second card in the "Cards row" section:

Replace:
```tsx
<Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
  <CardContent className="p-8 space-y-4">
    <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
      <Sparkles className="w-3 h-3 mr-2" />
      Free Workshop
    </div>
    <h2 className="text-2xl font-bold text-white">
      Web 2 → Web 3 in 1 Hour
    </h2>
    <p className="text-muted-foreground text-sm leading-relaxed">
      Full video guide: from zero to a deployed Starknet dApp using
      Medialane API. In Portuguese.
    </p>
    <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
      <Link href="/workshop">
        Watch Workshop
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Button>
  </CardContent>
</Card>
```

With:
```tsx
<Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
  <CardContent className="p-8 space-y-4">
    <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
      <Code2 className="w-3 h-3 mr-2" />
      Launchpad Services
    </div>
    <h2 className="text-2xl font-bold text-white">
      Deploy, Drop, and Credential
    </h2>
    <p className="text-muted-foreground text-sm leading-relaxed">
      POP Protocol for event credentials, Collection Drop for fixed-supply
      public minting, and Remix Licensing for derivative works — all accessible
      via one SDK.
    </p>
    <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
      <Link href="/docs/sdk">
        Explore the SDK
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Button>
  </CardContent>
</Card>
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "content: homepage pricing teaser and workshop card replacement"
```

---

## Task 3: Features Page Refresh

**Files:**
- Modify: `src/app/features/page.tsx`

- [ ] **Step 1: Update headline and subhead**

Replace:
```tsx
<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
  Everything you need to build on Starknet IP
</h1>
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  One REST API. All the data. No indexer needed.
</p>
```

With:
```tsx
<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
  Build on Creator Capital Markets
</h1>
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  The Medialane API covers the full platform surface — marketplace orders, assets, minting,
  licensing, drops, credentials, comments, and real-time events. One key, one SDK.
</p>
```

- [ ] **Step 2: Update the API_CARDS array with rewritten titles and descriptions**

Replace the entire `API_CARDS` constant:

```tsx
const API_CARDS = [
  {
    icon: ListOrdered,
    title: "Marketplace Orders",
    description:
      "Query active listings, bids, and completed sales. Filter by contract, token, or wallet. Powers the medialane.io marketplace.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Collections & Drops",
    description:
      "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Sparkles,
    title: "Launch & Mint",
    description:
      "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: FileImage,
    title: "Asset Metadata",
    description:
      "Resolve full metadata for any token, including license terms, remix history, and provenance.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: Activity,
    title: "On-chain Activity",
    description:
      "Stream every event: mints, transfers, sales, offers, cancellations — indexed in real time.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Signature,
    title: "Trade Intents",
    description:
      "Create and sign structured trade intents using SNIP-12. Submit orders without exposing private keys.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: HeartPulse,
    title: "Platform Status",
    description:
      "Real-time indexer and database health. Build reliable integrations with observable system state.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Search,
    title: "Search",
    description:
      "Full-text search across tokens, collections, and creators. Integrate autocomplete in any app.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: MessageSquare,
    title: "On-chain Comments",
    description:
      "Permanent comments anchored to any NFT via the NFTComments Cairo contract. Indexed in real time, Voyager-verifiable, with on-chain rate limiting and report-based auto-moderation.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: GitFork,
    title: "Remix Licensing",
    description:
      "Detect and enforce remix terms. Open licenses (CC0, CC BY, CC BY-SA, CC BY-NC) are auto-approved. Custom terms route through a creator approval flow before the requester can mint.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: ArrowLeftRight,
    title: "Counter-offers",
    description:
      "Buyers can counter any open listing with a custom price, duration, and message using SNIP-12 typed data. Sellers receive structured counter-offers they can accept or ignore.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Ticket,
    title: "POP Protocol",
    description:
      "Issue soulbound credentials tied to on-chain or off-chain events — conferences, workshops, hackathons. One claimable token per eligible wallet.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: ShoppingBag,
    title: "Collection Drop",
    description:
      "Launch fixed-supply public minting campaigns with configurable price, supply cap, time window, per-wallet limits, and optional allowlist gating.",
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
  },
]
```

- [ ] **Step 3: Move AI Agents section above the API grid**

The current order is: Hero → API grid → AI Agents → Webhooks → SDK → CTA.
Change to: Hero → AI Agents → API grid → Webhooks → SDK → CTA.

Cut the entire AI Agents `<section>` block (currently after the API grid) and paste it immediately after the closing tag of the Hero section and before the API grid section.

Updated AI Agents section (replace the existing one wherever it lives — after moving, update its content):

```tsx
{/* AI Agents section — move to top */}
<section className="container mx-auto px-4 pb-16 max-w-5xl">
  <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background/50">
    <CardContent className="p-10 flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl">
        <Bot className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Built for AI Agents</h2>
        <p className="text-muted-foreground leading-relaxed">
          Medialane is designed to be machine-native. A Starknet wallet keypair is all the
          identity an agent needs — no KYC, no OAuth, no human in the loop. Agents can
          authenticate headlessly, query the full API surface, and manage billing autonomously.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "SIWS headless auth — generate keypair, sign challenge, receive JWT",
            "x-api-key header — trivial to integrate from any runtime",
            "Deterministic JSON responses — no UI, no scraping",
            "Detect open-license assets (CC0) and autonomously request remix offers",
            "402 Payment Required when credits run out — machine-readable, not a human error page",
            "Agents can trigger USDC top-up on-chain to continue autonomously",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary">
          <Link href="/docs/agents">
            Agent Quickstart
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
</section>
```

- [ ] **Step 4: Remove PREMIUM badge from Webhooks section**

Replace:
```tsx
<Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">PREMIUM</Badge>
```

With: *(delete it — no replacement)*

- [ ] **Step 5: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add src/app/features/page.tsx
git commit -m "content: features page refresh — reframe cards, agents to top, remove PREMIUM"
```

---

## Task 4: Create `/integrate` Page

**Files:**
- Create: `src/app/integrate/page.tsx`

- [ ] **Step 1: Create the directory and page file**

```bash
mkdir -p /Users/kalamaha/dev/medialane-portal/src/app/integrate
```

- [ ] **Step 2: Write `src/app/integrate/page.tsx`**

```tsx
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { BackgroundGradients } from "@/src/components/background-gradients"
import { Check, Coins, Code2, Webhook, LayoutDashboard, ArrowRight, Zap } from "lucide-react"

const MDLN_TIERS = [
  { range: "500 – 999 MDLN", multiplier: "1.0×", note: "Base access" },
  { range: "1,000 – 1,999 MDLN", multiplier: "1.2×", note: "20% more credits per deposit" },
  { range: "2,000 – 4,999 MDLN", multiplier: "1.5×", note: "50% more credits per deposit" },
  { range: "5,000+ MDLN", multiplier: "2.0×", note: "Double credits per deposit" },
]

const CREDIT_COSTS = [
  { category: "Read / query", credits: "1 credit", examples: "Get asset, list collections, search, activity" },
  { category: "Trade intents (SNIP-12)", credits: "5 credits", examples: "Create listing, fulfill order, counter-offer" },
  { category: "Minting", credits: "10 credits", examples: "Mint token, batch mint" },
  { category: "Launchpad / deploy", credits: "100 credits", examples: "Deploy collection contract, Collection Drop, POP Protocol" },
]

export default function IntegratePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Integrate
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Start Building
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            API access is gated by MDLN token balance. Top up credits with USDC. Hold more MDLN for bonus credits.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link href="/account">Connect Wallet &amp; Get Access</Link>
          </Button>
        </section>

        {/* Section 1: MDLN Access Gate */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-white">MDLN Access Gate</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                To provision an API key you need a minimum of <strong className="text-white">500 MDLN</strong> in
                your wallet. Your tokens stay in your wallet — this is a balance check, not a fee or a lock-up.
                Holding more MDLN increases the credits you receive per USDC deposit.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">MDLN Balance</div>
                <div className="text-center text-white">Credit Multiplier</div>
                <div className="text-center text-primary">Bonus</div>
              </div>
              {MDLN_TIERS.map((tier, i) => (
                <div
                  key={tier.range}
                  className={`grid grid-cols-3 px-6 py-4 items-center text-sm ${i < MDLN_TIERS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-muted-foreground font-mono text-xs">{tier.range}</div>
                  <div className="text-center text-white font-bold text-lg">{tier.multiplier}</div>
                  <div className="text-center text-primary text-xs">{tier.note}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              MDLN balance is read on-chain at deposit time. Get MDLN at{" "}
              <a href="https://medialane.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                medialane.io
              </a>
              .
            </p>
          </div>
        </section>

        {/* Section 2: Credit System */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">Credits</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Credits are the billing unit. Top up by depositing USDC on Starknet from your{" "}
                <Link href="/account" className="text-primary hover:underline">dashboard</Link>.
                Credits never expire. Different endpoint categories consume different amounts per call.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">Category</div>
                <div className="text-center text-white">Cost</div>
                <div className="text-muted-foreground">Examples</div>
              </div>
              {CREDIT_COSTS.map((row, i) => (
                <div
                  key={row.category}
                  className={`grid grid-cols-3 px-6 py-4 items-start text-sm gap-4 ${i < CREDIT_COSTS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-white font-medium">{row.category}</div>
                  <div className="text-center">
                    <span className="font-mono font-bold text-primary">{row.credits}</span>
                  </div>
                  <div className="text-muted-foreground text-xs leading-relaxed">{row.examples}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
              <p className="text-sm font-semibold text-amber-300">402 Payment Required</p>
              <p className="text-xs text-muted-foreground">
                When your credit balance reaches zero, the API returns{" "}
                <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code>{" "}
                with an{" "}
                <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining: 0</code>{" "}
                header. AI agents can detect this response and trigger a USDC deposit autonomously.
                See the{" "}
                <Link href="/docs/agents" className="text-amber-300 hover:underline">
                  Agent Quickstart
                </Link>{" "}
                for a code example.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: What you get */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What you get</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: Code2,
                  title: "REST API",
                  desc: "One API key. All endpoints. Assets, orders, minting, licensing, drops, credentials, comments, and real-time events.",
                  href: "/docs/api",
                  link: "API Reference",
                },
                {
                  icon: Code2,
                  title: "TypeScript SDK",
                  desc: "@medialane/sdk — typed client with on-chain marketplace helpers. Framework-agnostic.",
                  href: "/docs/sdk",
                  link: "SDK Docs",
                },
                {
                  icon: Webhook,
                  title: "Webhooks",
                  desc: "Subscribe to on-chain events. Signed POST payloads pushed to your endpoint the moment an event is indexed.",
                  href: "/docs/api",
                  link: "Webhook Docs",
                },
                {
                  icon: LayoutDashboard,
                  title: "Dashboard",
                  desc: "Manage API keys, view credit balance, deposit USDC, and inspect usage history from your account.",
                  href: "/account",
                  link: "Go to Dashboard",
                },
              ].map((item) => (
                <Card key={item.title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="inline-flex p-2.5 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    <Link href={item.href} className="inline-flex items-center text-sm text-primary hover:underline gap-1">
                      {item.link}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Consumer App Examples */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Built on the same API</h2>
              <p className="text-muted-foreground text-sm">
                Both Medialane consumer apps are built entirely on the SDK and REST API — the same surface available to you.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">medialane.io</p>
                  <h3 className="text-lg font-bold text-white">Creator Launchpad</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Consumer-grade marketplace with invisible wallet (ChipiPay). Mint, list, remix,
                    and comment without managing a seed phrase. Runs on the Collections, Minting,
                    Orders, and Remix APIs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Collections", "Orders", "Minting", "Remix"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">dapp.medialane.io</p>
                  <h3 className="text-lg font-bold text-white">Permissionless dApp</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Fully on-chain reads via starknet.js. No backend dependency for browsing —
                    ideal for Starknet wallet holders. Uses Activities, Trade Intents, and
                    Asset Metadata APIs for real-time state.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Activities", "Trade Intents", "Asset Metadata"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/app/integrate/page.tsx
git commit -m "feat: add /integrate page — access model, credit costs, consumer app examples"
```

---

## Task 5: Redirect /pricing → /integrate and Update Nav

**Files:**
- Modify: `next.config.ts`
- Modify: `src/components/floating-nav.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add redirect in next.config.ts**

In `next.config.ts`, add `redirects` to the config object. Insert before the `typescript` key:

Replace:
```ts
const nextConfig: NextConfig = {
  typescript: {
```

With:
```ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/integrate",
        permanent: true,
      },
    ]
  },
  typescript: {
```

- [ ] **Step 2: Update floating-nav NAV_LINKS**

In `src/components/floating-nav.tsx`, replace:
```ts
const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Connect", href: "/connect" },
]
```

With:
```ts
const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Integrate", href: "/integrate" },
  { label: "Docs", href: "/docs" },
  { label: "Connect", href: "/connect" },
]
```

- [ ] **Step 3: Update sitemap**

In `src/app/sitemap.ts`, find any `/pricing` entry and replace with `/integrate`. If there are both, remove the `/pricing` one and keep only `/integrate`. (Read the file first to locate the exact string before editing.)

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/components/floating-nav.tsx src/app/sitemap.ts
git commit -m "feat: redirect /pricing to /integrate, update nav and sitemap"
```

---

## Task 6: Update Docs Page (`/docs`)

**Files:**
- Modify: `src/app/docs/page.tsx`

- [ ] **Step 1: Fix the /sign-in reference in Quick Start step 1**

Replace:
```tsx
Connect your Starknet wallet at <Link href="/sign-in" className="text-primary hover:underline">/sign-in</Link> and create an API key from the portal dashboard. You can create up to 5 keys.
```

With:
```tsx
Connect your Starknet wallet at <Link href="/account" className="text-primary hover:underline">/account</Link> and create an API key from the portal dashboard. You need a minimum of 500 MDLN in your wallet to provision a key.
```

- [ ] **Step 2: Update the Credits & Billing section**

Replace the entire Credits section content (from `<DocH2 id="credits">` through the end of its last `<p>`):

```tsx
{/* Credits */}
<DocH2 id="credits">Credits &amp; Billing</DocH2>
<p className="text-muted-foreground mb-3 text-sm">
  Credits are the billing unit. Top up by depositing USDC on Starknet from your{" "}
  <Link href="/account" className="text-primary hover:underline">account dashboard</Link>.
  Credits appear within ~2 minutes. Credits never expire.
</p>
<p className="text-muted-foreground mb-4 text-sm">
  Different endpoint categories consume different credits per call:
</p>
<div className="rounded-xl border border-white/10 overflow-hidden mb-4">
  <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    <span>Category</span>
    <span className="text-center">Credits</span>
    <span>Examples</span>
  </div>
  {[
    { cat: "Read / query", cost: "1", ex: "Get asset, list collections, search, activity" },
    { cat: "Trade intents", cost: "5", ex: "Create listing, fulfill order, counter-offer" },
    { cat: "Minting", cost: "10", ex: "Mint token, batch mint" },
    { cat: "Launchpad / deploy", cost: "100", ex: "Deploy contract, Collection Drop, POP Protocol" },
  ].map((row, i, arr) => (
    <div key={row.cat} className={`grid grid-cols-3 px-5 py-3 items-start text-sm ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
      <span className="text-white">{row.cat}</span>
      <span className="text-center font-mono font-bold text-primary">{row.cost}</span>
      <span className="text-muted-foreground text-xs">{row.ex}</span>
    </div>
  ))}
</div>
<p className="text-muted-foreground text-sm mb-3">
  Hold MDLN tokens for a credit multiplier — up to 2× more credits per USDC deposit.
  See the <Link href="/integrate" className="text-primary hover:underline">Integrate page</Link> for tier details.
</p>
<p className="text-muted-foreground text-sm">
  When credits run out you receive{" "}
  <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code>{" "}
  with an{" "}
  <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining: 0</code>{" "}
  header. Portal management calls (<code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/portal/*</code>)
  never count toward the credit balance. Autonomous agents can detect the 402 and trigger a
  top-up automatically — see the{" "}
  <Link href="/docs/agents" className="text-primary hover:underline">Agent Quickstart</Link>.
</p>
```

- [ ] **Step 3: Add Use Cases section after Credits (before the closing div)**

Append inside the return, after the credits `<DocH2>` block and before the closing `</div>`:

```tsx
{/* Use cases */}
<DocH2 id="use-cases">Use Cases</DocH2>
<p className="text-muted-foreground mb-4 text-sm">
  Both Medialane consumer apps are built on the same API you&apos;re integrating:
</p>
<div className="grid md:grid-cols-2 gap-4 mb-6">
  {[
    {
      domain: "medialane.io",
      role: "Creator Launchpad",
      desc: "Uses Collections, Orders, Minting, Remix Licensing, and On-chain Comments APIs. Runs a ChipiPay invisible-wallet UX for end users.",
    },
    {
      domain: "dapp.medialane.io",
      role: "Permissionless dApp",
      desc: "Uses Activities, Trade Intents, and Asset Metadata APIs with direct starknet.js reads — no backend dependency for browsing.",
    },
  ].map((s) => (
    <div key={s.domain} className="rounded-xl border border-white/10 p-5 space-y-2 bg-white/[0.02]">
      <p className="text-xs font-mono text-muted-foreground">{s.domain}</p>
      <p className="text-sm font-semibold text-white">{s.role}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
    </div>
  ))}
</div>
<DocH3>Common patterns</DocH3>
<DocCodeBlock lang="ts">{`// Fetch a creator's portfolio
const assets = await client.api.getTokensByOwner({ owner: "0x05f9..." });

// List open-license assets available for remix
import { OPEN_LICENSES } from "@medialane/sdk";
const cc0 = await client.api.getTokens({ licenseType: OPEN_LICENSES });

// Stream on-chain activity
const events = await client.api.getActivities({ eventType: "TRANSFER" });

// Submit a listing intent (agent or wallet)
const intent = await client.api.createListingIntent({ tokenId, price, duration });
const sig = await account.signMessage(intent.typedData);`}</DocCodeBlock>
```

- [ ] **Step 4: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "content: docs page — fix sign-in link, variable credit costs table, use cases section"
```

---

## Task 7: Update `/docs/sdk` — Add Use Case Examples

**Files:**
- Modify: `src/app/docs/sdk/page.tsx` (append new section at the end, before closing `</div>`)

- [ ] **Step 1: Read the end of the SDK page to find the last section**

```bash
tail -50 /Users/kalamaha/dev/medialane-portal/src/app/docs/sdk/page.tsx
```

Note the last `<DocH2>` section and the closing `</div>` tag location.

- [ ] **Step 2: Add use case examples and consumer app showcase before the closing `</div>`**

Find the last content section in the file (likely the Error Codes section ending with `</div>`) and append immediately before the outer closing `</div>`:

```tsx
{/* Use case examples */}
<DocH2 id="examples" border>Use Case Examples</DocH2>
<p className="text-muted-foreground text-sm mb-3">
  Common patterns you can build with the SDK:
</p>

<DocH3>Fetch a creator&apos;s portfolio</DocH3>
<DocCodeBlock lang="ts">{`const portfolio = await client.api.getTokensByOwner({
  owner: "0x05f9...",
  limit: 20,
});
// portfolio.data → array of token objects with metadata, license terms, remixCount`}</DocCodeBlock>

<DocH3>List open-license assets for remix</DocH3>
<DocCodeBlock lang="ts">{`import { OPEN_LICENSES } from "@medialane/sdk";

const openAssets = await client.api.getTokens({
  licenseType: OPEN_LICENSES, // ["CC0", "CC BY", "CC BY-SA", "CC BY-NC"]
});`}</DocCodeBlock>

<DocH3>Submit a trade intent (no private key exposure)</DocH3>
<DocCodeBlock lang="ts">{`const intent = await client.api.createListingIntent({
  contractAddress: "0x04a...",
  tokenId: "42",
  price: "0.05",       // in ETH
  currency: "ETH",
  duration: 86400,     // seconds
});

// sign off-chain, submit on-chain
const sig = await account.signMessage(intent.typedData);
await client.api.submitOrder({ ...intent, signature: sig });`}</DocCodeBlock>

<DocH3>Stream on-chain activity</DocH3>
<DocCodeBlock lang="ts">{`const activity = await client.api.getActivities({
  eventType: "TRANSFER",   // TRANSFER | ORDER_CREATED | ORDER_FULFILLED | ORDER_CANCELLED
  contractAddress: "0x04a...",
  limit: 50,
});`}</DocCodeBlock>

<DocH2 id="consumer-apps" border>Built with the SDK</DocH2>
<p className="text-muted-foreground text-sm mb-4">
  Both Medialane consumer apps use the same SDK you&apos;re integrating:
</p>
<div className="grid md:grid-cols-2 gap-4 not-prose">
  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
    <p className="text-xs font-mono text-muted-foreground">medialane.io</p>
    <p className="text-sm font-semibold text-white">Creator Launchpad</p>
    <p className="text-xs text-muted-foreground leading-relaxed">
      Collections, Orders, Minting, Remix Licensing, POP, Collection Drop, On-chain Comments.
      Invisible wallet UX via ChipiPay.
    </p>
  </div>
  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-2">
    <p className="text-xs font-mono text-muted-foreground">dapp.medialane.io</p>
    <p className="text-sm font-semibold text-white">Permissionless dApp</p>
    <p className="text-xs text-muted-foreground leading-relaxed">
      Activities, Trade Intents, Asset Metadata. Direct starknet.js reads — no backend dependency for browsing.
    </p>
  </div>
</div>

<div className="mt-6 pt-6 border-t border-white/10 space-y-2">
  <p className="text-sm font-semibold text-white">Full SDK documentation</p>
  <p className="text-sm text-muted-foreground">
    Complete method reference, type definitions, and advanced usage are on{" "}
    <a href="https://docs.medialane.io/docs/sdk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
      docs.medialane.io/docs/sdk
    </a>
    .
  </p>
</div>
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/app/docs/sdk/page.tsx
git commit -m "content: SDK page — use case examples and consumer app showcase"
```

---

## Task 8: Update `/docs/agents` — MDLN Gate Context

**Files:**
- Modify: `src/app/docs/agents/page.tsx`

- [ ] **Step 1: Read the current agents page to find the "Why agents" section**

```bash
head -40 /Users/kalamaha/dev/medialane-portal/src/app/docs/agents/page.tsx
```

- [ ] **Step 2: Add MDLN gate to the "why agents" bullet list**

In the `<ul>` inside the `{/* Why agents */}` section, add one bullet after the `Billing` bullet:

Find:
```tsx
<li><strong className="text-white">Billing</strong> — USDC on Starknet. Deposit on-chain, credits settle within ~2 minutes.</li>
<li><strong className="text-white">Credit exhaustion</strong> — machine-readable <code ...>402</code> ...
```

Insert between them:
```tsx
<li><strong className="text-white">Access gate</strong> — 500 MDLN minimum in the agent wallet to provision an API key. Tokens stay in the wallet.</li>
```

- [ ] **Step 3: Verify build**

```bash
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/app/docs/agents/page.tsx
git commit -m "content: agents page — add MDLN access gate context"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Full build**

```bash
~/.bun/bin/bun run build 2>&1 | grep -E "(error|Error|warning|✓|✗|Failed)"
```

Expected: `✓ Compiled successfully` and no TypeScript errors.

- [ ] **Step 2: Check for any remaining /sign-in references in page content**

```bash
grep -rn "sign-in\|/sign-in" \
  src/app/page.tsx \
  src/app/features/page.tsx \
  src/app/pricing/page.tsx \
  src/app/docs/page.tsx \
  src/app/integrate/page.tsx
```

Expected: zero matches (the auth API routes may still reference sign-in internally — only check page content files).

- [ ] **Step 3: Check for /pricing links that should now be /integrate**

```bash
grep -rn '"/pricing"' src/app/ src/components/
```

Expected: zero matches (the redirect handles old bookmarks, but internal links should all point to `/integrate`).

- [ ] **Step 4: Check for /workshop links**

```bash
grep -rn '"/workshop"' src/app/ src/components/
```

Expected: zero matches.

- [ ] **Step 5: Final commit**

```bash
git add -A
git status
# Stage any unstaged files from earlier tasks if needed
git commit -m "content: content and messaging refresh complete"
```
