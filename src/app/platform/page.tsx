import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  Lock, Database, Package, Monitor, ShieldCheck,
  ShoppingBag, Sparkles, ArrowRight, TrendingUp,
} from "lucide-react"

const LAYERS = [
  {
    num: "01",
    label: "Chain",
    icon: Lock,
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    desc: "Immutable Cairo contracts on Starknet. The only source of truth. No admin key can change the rules once deployed.",
  },
  {
    num: "02",
    label: "Indexer",
    icon: Database,
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
    desc: "Reads on-chain events and builds a queryable cache. Delete the database and it rebuilds itself from the chain.",
  },
  {
    num: "03",
    label: "SDK",
    icon: Package,
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
    desc: "A typed interface and service registry. Everything the app can do, the SDK exposes to any integrator.",
  },
  {
    num: "04",
    label: "Apps",
    icon: Monitor,
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
    desc: "Medialane's own apps and partner apps. Views and workflows. None of them can override what the contracts say.",
  },
]

const HUBS = [
  {
    icon: Sparkles,
    title: "Launchpad",
    description: "Structure and issue: collection drops, editions, memberships, tickets, and coins.",
    href: "/services",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "List, buy, offer, and auction. Payment and asset move together, or neither moves at all.",
    href: "/services",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
]

export default function PlatformPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 inline" />
            Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            How Medialane actually works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tokenization turns an asset into a digital record that can be owned, traded, and verified.
            It&apos;s the same idea behind real-world asset tokenization for real estate or bonds, applied
            to intellectual property instead.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Four layers, one system</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Authority only ever flows down. The chain is the only truth; everything above it is a
              cache, a lens, or a view.
            </p>
          </div>
          <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02]">
            {LAYERS.map(({ num, label, icon: Icon, color, bg, desc }, i) => (
              <div
                key={num}
                className={`flex items-start gap-4 px-6 py-5 ${i < LAYERS.length - 1 ? "border-b border-border/50" : ""}`}
              >
                <div className={`h-10 w-10 shrink-0 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${color}`}>{num}</span>
                    <p className="font-bold text-foreground">{label}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Two hubs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Everything Medialane does falls into issuing an asset or trading one.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {HUBS.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={title} href={href} className="group">
                <Card className="border-border bg-foreground/5 backdrop-blur-sm h-full transition-all group-hover:border-foreground/20">
                  <CardContent className="p-6 space-y-3">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <Card className="border-brand-purple/20 bg-brand-purple/5 backdrop-blur-sm">
            <CardContent className="p-8 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-purple" />
                <Badge variant="outline" className="text-xs">Coming</Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground">Value you can verify</h3>
              <p className="text-sm text-muted-foreground">
                Starknet&apos;s proof system lets Medialane attest to real-world facts on-chain: how many
                times a song streamed, how many times an article was cited. As those proofs accumulate,
                a licensed asset&apos;s value becomes something anyone can verify for themselves.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            See what you can issue and trade today.
          </p>
          <Button asChild size="lg">
            <Link href="/services">
              View Launchpad services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
