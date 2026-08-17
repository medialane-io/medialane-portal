import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  LayoutGrid, Layers, Ticket, Coins, GraduationCap, Handshake, Sparkles,
  ShoppingBag, ArrowRight,
} from "lucide-react"

const LAUNCHPAD_SERVICES = [
  {
    icon: LayoutGrid,
    title: "Collection Drops",
    description: "Sequential minting with claim windows and an allowlist. Built for a launch with a start time and a cap.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Layers,
    title: "NFT Editions",
    description: "Multiple copies of one piece, minted by the creator. For work that isn't meant to be one-of-one.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Sparkles,
    title: "IP Collection",
    description: "A single-owner collection for standalone pieces, with full licensing and provenance attached.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: GraduationCap,
    title: "POP Protocol",
    description: "Soulbound proof-of-presence. Issue a credential for attendance or membership that can't be transferred away.",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
  {
    icon: Ticket,
    title: "IP Tickets",
    description: "Redeemable, resellable admission tickets, issued per event through your own factory.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    icon: Handshake,
    title: "IP Club",
    description: "Membership clubs with an NFT membership card. One registry, ongoing access instead of a single event.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Coins,
    title: "Creator Coins",
    description: "A fixed-supply token for a creator or a community, launched permissionlessly with a locked liquidity pool.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
]

const MARKETPLACE_FEATURES = [
  "List an asset for sale",
  "Make or accept an offer",
  "Run an auction",
  "License or remix with attribution",
]

export default function ServicesPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Launchpad
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Every way to issue, in one place
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The Launchpad grows by adding new services alongside the ones already running.
            Here&apos;s what&apos;s live today.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LAUNCHPAD_SERVICES.map(({ icon: Icon, title, description, color, bg }) => (
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

        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <Card className="border-border bg-foreground/5 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-brand-rose/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-rose" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Marketplace</h2>
                <p className="text-sm text-muted-foreground">
                  Every asset issued through the Launchpad can trade here. Payment and asset move
                  in one transaction, or neither moves. There&apos;s no escrow holding funds in between.
                </p>
                <Button asChild variant="outline">
                  <Link href="/developers">
                    See the API
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <ul className="space-y-2">
                {MARKETPLACE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-rose shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
