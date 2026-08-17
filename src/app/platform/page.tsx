import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import {
  Lock, Database, Package, Monitor, ShieldCheck,
  ShoppingBag, Sparkles, ArrowRight, TrendingUp,
} from "lucide-react"

const LAYERS: FeatureRowItem[] = [
  {
    icon: Lock,
    eyebrow: "01 · The rules",
    color: "bg-brand-purple",
    title: "Set once, in public",
    description: "Contracts are immutable and permissionless. Once deployed, they stay exactly as set, including for Medialane itself.",
  },
  {
    icon: Database,
    eyebrow: "02 · The record",
    color: "bg-brand-blue",
    title: "Every asset, sale, and license, kept",
    description: "The full history is searchable and could be rebuilt from nothing if it ever needed to be, replayed straight from on-chain events.",
  },
  {
    icon: Package,
    eyebrow: "03 · The connection",
    color: "bg-brand-orange",
    title: "One shared catalog",
    description: "Any product, Medialane's own or a partner's, plugs into the same capabilities and the same catalog through the SDK.",
  },
  {
    icon: Monitor,
    eyebrow: "04 · The apps",
    color: "bg-brand-rose",
    title: "Different views, same record",
    description: "Medialane's apps and partner apps are just different ways of using the same underlying record. None of them can bend what it says.",
  },
]

const HUBS = [
  {
    icon: Sparkles,
    title: "Launchpad",
    description: "Create and release something new: a collection, an edition, a membership, a ticket, a sponsorship offer, or a coin for your community.",
    href: "/services",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy, sell, and license everything issued on Medialane. A sale pays out the moment it completes, directly between buyer and seller, with no escrow holding funds in between.",
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
            Tokenization turns something you own into a digital record you can trade, license, and
            verify on Starknet, secured by zero-knowledge validity proofs at every step. It&apos;s the
            same idea behind tokenizing real estate or bonds, applied to intellectual property.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Four layers, one system</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Authority only flows down. The chain is the only truth; everything above it is a
              cache, a lens, or a view.
            </p>
          </div>
          <FeatureRowList items={LAYERS} />
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
                Starknet&apos;s proof system will let Medialane attest to real-world facts on-chain: how many
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
