import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  ListOrdered, LayoutGrid, FileImage, Activity, Signature,
  Code2, Zap,
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

const API_CARDS = [
  { icon: ListOrdered, title: "Marketplace Orders", description: "Query active listings, bids, and completed sales. Filter by contract, token, or wallet.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: LayoutGrid, title: "Collections & Drops", description: "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
  { icon: Zap, title: "Launch & Mint", description: "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment.", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: FileImage, title: "Decentralized Metadata", description: "Resolve full metadata for any token, including license terms, remix history, and provenance.", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Activity, title: "Onchain Activity", description: "Stream every event, from mints and transfers to sales, offers, and cancellations, indexed in real time.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Signature, title: "Trade Intents", description: "Sign a buy or sell order with your wallet without exposing your private key. Submit it, and it settles or it doesn't; nothing sits in escrow in between.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
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

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
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
      </div>
    </div>
  )
}
