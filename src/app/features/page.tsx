import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { BackgroundGradients } from "@/src/components/background-gradients"
import {
  ListOrdered,
  LayoutGrid,
  FileImage,
  Activity,
  Signature,
  Search,
  Bot,
  Webhook,
  Code2,
  ArrowRight,
  Check,
  Zap,
  Sparkles,
  HeartPulse,
  MessageSquare,
  GitFork,
  ArrowLeftRight,
  Ticket,
  ShoppingBag,
} from "lucide-react"

const API_CARDS = [
  {
    icon: ListOrdered,
    title: "Orders & Listings",
    description: "Query open orders, bids, and fulfilled listings across the marketplace. Filter by NFT contract, token, or user.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Collections",
    description: "Fetch collection metadata, floor prices, volume, and token inventories for any Starknet IP collection.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Sparkles,
    title: "Minting & Launchpad",
    description: "Launch collection contracts and mint assets with ease. Get ready-to-execute calldata for on-chain deployment.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: FileImage,
    title: "Tokens & Metadata",
    description: "Resolve metadata for any token. Use JIT resolution for instant data on newly minted assets.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: Activity,
    title: "Activities",
    description: "Stream on-chain events: mints, transfers, sales, offers, cancellations — indexed in real time.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Signature,
    title: "Intents (SNIP-12)",
    description: "Create, sign, and submit structured trade intents using the SNIP-12 typed data standard on Starknet.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: HeartPulse,
    title: "Health & Monitoring",
    description: "Real-time system health checks. Monitor indexer lag and database status for your enterprise integrations.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Search,
    title: "Search",
    description: "Full-text search across tokens, collections, and creators. Integrate autocomplete in your dApp in minutes.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: MessageSquare,
    title: "On-chain Comments",
    description: "Permanent comments anchored to any NFT via the NFTComments Cairo contract. Indexed in real time, Voyager-verifiable, with on-chain 60s rate limiting and report-based auto-moderation.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: GitFork,
    title: "Remix Licensing",
    description: "IP remix offer and self-remix system. Open licenses (CC0, CC BY, CC BY-SA, CC BY-NC) are auto-approved. Custom terms route through a creator approval flow before the requester can mint.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: ArrowLeftRight,
    title: "Counter-offers",
    description: "Buyers can counter any open listing with a custom price, duration, and message using SNIP-12 typed data. Sellers receive structured counter-offers they can accept or ignore.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Ticket,
    title: "POP Protocol",
    description: "Proof of Participation claim collections for events — conferences, workshops, hackathons, bootcamps. One claimable token per eligible wallet. Check eligibility, batch-query up to 100 wallets, and manage allowlists via the SDK.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: ShoppingBag,
    title: "Collection Drop",
    description: "Public minting campaigns with configurable claim conditions: price, supply cap, time window, per-wallet limits, and optional allowlist gating. Deploy via the SDK and manage phases on-chain.",
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
  },
]

const WEBHOOK_EVENTS = [
  { name: "ORDER_CREATED", desc: "A new listing or bid is created on-chain" },
  { name: "ORDER_FULFILLED", desc: "A sale is completed — buyer and seller resolved" },
  { name: "ORDER_CANCELLED", desc: "An order is cancelled by the offerer" },
  { name: "TRANSFER", desc: "Any ERC-721 token transfer, including mints" },
]

export default function FeaturesPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-5xl text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Platform Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Everything you need to build on Starknet IP
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One REST API. All the data. No indexer needed.
          </p>
        </section>

        {/* API Surface Grid */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {API_CARDS.map((card) => (
              <Card key={card.title} className={`${card.border} bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-colors`}>
                <CardContent className="p-6 space-y-3">
                  <div className={`inline-flex p-2.5 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h3 className="font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Agents section */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background/50">
            <CardContent className="p-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Built for AI Agents</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Medialane is designed to be machine-native. An API key is all the identity an agent needs — no KYC, no wallet connection, no human in the loop. Agents can query listings, submit trade intents, and read on-chain activity autonomously.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Stateless REST — no sessions or cookies",
                    "x-api-key header auth — trivial to integrate",
                    "Deterministic JSON responses",
                    "Unlimited monthly quota on PREMIUM — scale without friction",
                    "Detect open-license assets (CC0) and autonomously request remix offers",
                    "Query on-chain comments and IP metadata without a wallet",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Webhooks — PREMIUM */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Webhook className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Webhooks</h2>
              <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">PREMIUM</Badge>
            </div>
            <p className="text-muted-foreground">
              Subscribe to real-time on-chain events. Medialane pushes a signed POST payload to your endpoint the moment an event is indexed — no polling needed.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {WEBHOOK_EVENTS.map((ev) => (
                <div key={ev.name} className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-mono font-semibold text-amber-300">{ev.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SDK Card */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 p-3 bg-white/10 rounded-xl">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3 flex-1">
                <h2 className="text-xl font-bold text-white">@medialane/sdk</h2>
                <p className="text-muted-foreground text-sm">
                  Framework-agnostic TypeScript SDK. On-chain marketplace calls + full REST API client in one package.
                </p>
                <div className="rounded-lg bg-black/40 border border-white/10 px-4 py-2.5 font-mono text-sm text-green-300">
                  bun add @medialane/sdk
                </div>
              </div>
              <Button asChild variant="outline" className="flex-shrink-0 border-white/10 hover:bg-white/5">
                <Link href="/docs/sdk">
                  SDK Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 pb-24 max-w-5xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Ready to build?</h2>
          <p className="text-muted-foreground">Get a free API key and go live in minutes.</p>
          <Button asChild size="lg" className="px-10">
            <Link href="/account">Get Free API Key</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
