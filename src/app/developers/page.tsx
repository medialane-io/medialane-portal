import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  ListOrdered, LayoutGrid, FileImage, Activity, Signature,
  Code2, Zap,
} from "lucide-react"

const API_CARDS = [
  { icon: ListOrdered, title: "Marketplace Orders", description: "Query active listings, bids, and completed sales. Filter by contract, token, or wallet.", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20" },
  { icon: LayoutGrid, title: "Collections & Drops", description: "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources.", color: "text-brand-blue", bg: "bg-brand-blue/10", border: "border-brand-blue/20" },
  { icon: Zap, title: "Launch & Mint", description: "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment.", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20" },
  { icon: FileImage, title: "Decentralized Metadata", description: "Resolve full metadata for any token, including license terms, remix history, and provenance.", color: "text-brand-rose", bg: "bg-brand-rose/10", border: "border-brand-rose/20" },
  { icon: Activity, title: "Onchain Activity", description: "Stream every event, from mints and transfers to sales, offers, and cancellations, indexed in real time.", color: "text-brand-maeve", bg: "bg-brand-maeve/10", border: "border-brand-maeve/20" },
  { icon: Signature, title: "Trade Intents", description: "Create and sign structured trade intents using SNIP-12. Submit orders without exposing private keys.", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20" },
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
            Assets, orders, licensing, drops, and live events. Connect a wallet to get a key
            and start building.
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

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {API_CARDS.map(({ icon: Icon, title, description, color, bg, border }) => (
              <Card key={title} className={`${border} ${bg} backdrop-blur-sm`}>
                <CardContent className="p-6 space-y-3">
                  <Icon className={`w-6 h-6 ${color}`} />
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
