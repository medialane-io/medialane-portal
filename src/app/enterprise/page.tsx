import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import {
  Building2, ScrollText, Ticket, Handshake, Users, Layers, Bot, ArrowRight,
  Lock, Wallet, ShoppingBag, Zap,
} from "lucide-react"

const UMBRELLAS = [
  {
    icon: Building2,
    title: "Tokenization for Enterprise",
    description: "Credentials, digital passes, and payouts handled on your behalf.",
    href: "/enterprise/tokenize",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: ScrollText,
    title: "Tokenization for IP",
    description: "Protect creative work worldwide: proof of authorship in minutes, plus licensing and catalog tracking, including for AI use.",
    href: "/enterprise/ip",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
]

const STATS = [
  { value: "13", label: "Live Launchpad services" },
  { value: "181", label: "Countries with automatic copyright protection" },
  { value: "0", label: "Escrow accounts holding your funds" },
]

const WHY: FeatureRowItem[] = [
  {
    icon: Lock,
    eyebrow: "Immutable & permissionless",
    color: "bg-brand-blue",
    title: "Set once, in public",
    description: "Contracts are immutable and permissionless. Once deployed, they stay exactly as set, including for Medialane itself.",
  },
  {
    icon: Wallet,
    eyebrow: "Self-custody",
    color: "bg-brand-orange",
    title: "Held in your audience's own wallet",
    description: "Every credential, ticket, and membership card lives in the holder's own wallet. Nothing for your organization to store.",
  },
  {
    icon: ShoppingBag,
    eyebrow: "Direct settlement",
    color: "bg-brand-rose",
    title: "Payment and asset move together",
    description: "Sales, licenses, and sponsorships settle directly between the two parties, in one transaction, or neither moves.",
  },
  {
    icon: Zap,
    eyebrow: "x402 payments",
    color: "bg-brand-maeve",
    title: "Pay per use, get paid per use",
    description: "Every call is metered over x402, the same rail enterprises and AI agents both use to pay for access.",
  },
]

const MONETIZATION = [
  { icon: Ticket, title: "Tickets", description: "Verifiable, resellable admission tickets, issued per event.", href: "/enterprise/tickets", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: Users, title: "Clubs", description: "Membership tiers, minted as cards, for ongoing access.", href: "/enterprise/clubs", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Layers, title: "Limited Editions", description: "Numbered copies or timed drops, at whatever run size you choose.", href: "/enterprise/editions", color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { icon: Handshake, title: "Sponsorship", description: "Direct sponsorship offers settled asset-to-asset, with no escrow.", href: "/enterprise/sponsorship", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Bot, title: "AI Data & Training", description: "Get paid per call, over x402, when AI systems use your catalog.", href: "/enterprise/ai-data", color: "text-brand-orange", bg: "bg-brand-orange/10" },
]

export default function EnterprisePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Enterprise
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Tokenization and monetization, on your terms
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schools, festivals, publishers, and rights holders use Medialane to issue, license,
            and monetize digital assets. No blockchain experience needed on your end, or your
            audience&apos;s.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl md:text-5xl font-black text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {UMBRELLAS.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={href} href={href} className="group">
                <Card className="border-border bg-foreground/5 backdrop-blur-sm h-full transition-all group-hover:border-foreground/20">
                  <CardContent className="p-8 space-y-4">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
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

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Why enterprises tokenize with Medialane</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            The same protocol properties every asset on Medialane gets, applied to your business.
          </p>
          <FeatureRowList items={WHY} />
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Monetization services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MONETIZATION.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={href} href={href} className="group">
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
      </div>
    </div>
  )
}
