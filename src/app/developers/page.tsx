import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import {
  ListOrdered, LayoutGrid, FileImage, Activity, Signature,
  Code2, Zap, KeyRound, Send, Ticket, Handshake, Coins,
  Building2, Bot, ArrowRight, Blocks,
} from "lucide-react"

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

const QUICKSTART: FeatureRowItem[] = [
  {
    icon: KeyRound,
    eyebrow: "Step 1",
    color: "bg-brand-blue",
    title: "Connect a wallet, get an API key",
    description: "Any Starknet keypair works, human or agent. Provision credits and issue a key from your account dashboard.",
  },
  {
    icon: Blocks,
    eyebrow: "Step 2",
    color: "bg-brand-orange",
    title: "Read the service registry",
    description: "Every service, mip-erc721, ip-erc721, drop-collection, ip-tickets, ip-club, ip-sponsorship, creator-coin, and more, is described as structured JSON. No hardcoded per-route behavior to guess at.",
  },
  {
    icon: Send,
    eyebrow: "Step 3",
    color: "bg-brand-rose",
    title: "Call the API or sign an intent",
    description: "Read endpoints return indexed data directly. Write actions return ready-to-sign calldata; your key never leaves your device.",
  },
]

const API_CARDS = [
  { icon: ListOrdered, title: "Marketplace Orders", description: "Query active listings, bids, and completed sales. Filter by contract, token, or wallet.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: LayoutGrid, title: "Collections & Drops", description: "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
  { icon: Zap, title: "Launch & Mint", description: "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment.", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: FileImage, title: "Decentralized Metadata", description: "Resolve full metadata for any token, including license terms, remix history, and provenance.", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Activity, title: "Onchain Activity", description: "Stream every event, from mints and transfers to sales, offers, and cancellations, indexed in real time.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Signature, title: "Trade Intents", description: "Sign a buy or sell order with your wallet, keeping your private key on your own device. Submit it for direct settlement.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
  { icon: Ticket, title: "Tickets & Clubs", description: "Issue and query redeemable tickets and tiered membership cards, per-creator factories with full holder history.", color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { icon: Handshake, title: "Sponsorship", description: "Direct-settlement sponsorship bids and licenses, no escrow, settled the moment a deal closes.", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: Coins, title: "Creator Coins", description: "Deploy and track fixed-supply creator coins, Ekubo-only, ownership renounced at launch.", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
]

const AUDIENCES = [
  { icon: Code2, title: "Developers", description: "Typed SDK access, a service registry, and a single metered API for every live service on the protocol.", href: "/developers", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Building2, title: "Business", description: "Fully managed tokenization and monetization for schools, festivals, publishers, and rights holders.", href: "/enterprise", color: "text-brand-orange", bg: "bg-brand-orange/10" },
  { icon: Bot, title: "AI Agents", description: "Headless authentication and x402 pay-per-call access, the same fee schedule as a human integrator.", href: "/agents", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
]

const RESOURCES = [
  { title: "API Reference", href: "https://docs.medialane.io/dev/api" },
  { title: "SDK (@medialane/sdk)", href: "https://docs.medialane.io/dev/sdk" },
  { title: "Developer guide", href: "https://docs.medialane.io/dev/developers" },
  { title: "Architecture", href: "https://docs.medialane.io/dev/architecture" },
  { title: "Pricing", href: "/pricing" },
]

export default function DevelopersPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Code2 className="w-3.5 h-3.5 mr-1.5 inline" />
            Developers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            One API for the whole protocol
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One API covers every live service: minting, marketplace orders, licensing, drops,
            tickets, clubs, sponsorship, and coins. Connect a wallet to get a key and start
            building. Paid over x402, per call, the same rail enterprises and AI agents both use.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="px-10">
              <Link href="/account">Connect Wallet &amp; Get Access</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-10">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Get building in three steps</h2>
          <FeatureRowList items={QUICKSTART} />
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-foreground/[0.03]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">GET /v1/collections</span>
            </div>
            <pre className="p-4 text-xs font-mono text-green-500/90 overflow-x-auto leading-relaxed">
              {SAMPLE_RESPONSE}
            </pre>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Every live service, one API</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {API_CARDS.map(({ icon: Icon, title, description, color, bg }) => (
              <Card key={title} className="border-border bg-foreground/5 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-2">Built for every caller</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            The same registry and the same API, three different ways in.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {AUDIENCES.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={title} href={href} className="group">
                <Card className="border-border bg-foreground/5 backdrop-blur-sm h-full transition-all group-hover:border-foreground/20">
                  <CardContent className="p-6 space-y-3">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <div className="flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Resources</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {RESOURCES.map(({ title, href }) => (
              <Button key={title} asChild variant="outline" size="sm">
                {href.startsWith("http") ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">{title}</a>
                ) : (
                  <Link href={href}>{title}</Link>
                )}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
