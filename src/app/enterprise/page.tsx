import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import {
  Building2, ScrollText, Ticket, Handshake, Users, Layers, Bot, ArrowRight,
  ShieldCheck, KeyRound, Banknote, Repeat, TrendingUp, Award, GitBranch, ShoppingBag,
  ImagePlus, Gem,
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
  { value: "$63B", label: "Global intellectual property industry" },
  { value: "181", label: "Countries with automatic copyright protection" },
  { value: "13", label: "Live tokenization services" },
]

const WHY: FeatureRowItem[] = [
  {
    icon: ShieldCheck,
    eyebrow: "Immutable by design",
    color: "bg-brand-blue",
    title: "Compliance you can point to",
    description: "Rules and royalty terms are secured by immutable contracts the moment you launch, including for Medialane itself. Any later change requires your sign-off.",
  },
  {
    icon: KeyRound,
    eyebrow: "Direct ownership",
    color: "bg-brand-orange",
    title: "Your audience owns it directly",
    description: "Every credential, ticket, and membership card is owned directly by the holder. No account system for your team to maintain or reconcile.",
  },
  {
    icon: Banknote,
    eyebrow: "Instant settlement",
    color: "bg-brand-rose",
    title: "Paid the moment a deal completes",
    description: "Sales, licenses, and sponsorships pay out the instant a transaction completes, worldwide, directly between the two parties.",
  },
  {
    icon: Repeat,
    eyebrow: "Usage-based payments",
    color: "bg-brand-maeve",
    title: "Pay for use, get paid for use",
    description: "Access is metered automatically. You pay only for what you use, and get paid the same way when others, including AI systems, use your catalog.",
  },
]

const MONETIZATION = [
  { icon: ScrollText, title: "Tokenize & License IP", description: "Register your intellectual property and license it for reuse, including for AI training.", href: "/enterprise/ip", color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { icon: ImagePlus, title: "NFT Collections", description: "Publish and manage collections of unique or numbered works under your own brand.", href: "/services", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Ticket, title: "Tickets", description: "Verifiable, resellable admission tickets, issued at scale for any event.", href: "/enterprise/tickets", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: Users, title: "Clubs", description: "Tiered membership programs, issued as tradeable cards, for ongoing audience relationships.", href: "/enterprise/clubs", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Layers, title: "Limited Editions", description: "Controlled-supply releases and timed drops, sized to your catalog.", href: "/enterprise/editions", color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { icon: Handshake, title: "Sponsorship", description: "Structured sponsorship deals between your brand and rights holders, settled automatically.", href: "/enterprise/sponsorship", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Bot, title: "AI Data & Training", description: "Turn catalog access for AI training into a recurring revenue line.", href: "/enterprise/ai-data", color: "text-brand-orange", bg: "bg-brand-orange/10" },
  { icon: ShoppingBag, title: "Marketplace", description: "List, offer, and auction everything you issue, in one connected market.", href: "/services", color: "text-brand-blue", bg: "bg-brand-blue/10" },
]

const MORE_CAPABILITIES = [
  { icon: TrendingUp, title: "Creator Capital Markets", description: "Launch a public trading market for your brand or community, and stay in control of it." },
  { icon: Award, title: "Proof of Participation", description: "Issue permanent, tamper-proof badges your audience can claim and keep." },
  { icon: GitBranch, title: "Remix & Licensing", description: "License your catalog for reuse, with royalties flowing back to you automatically." },
  { icon: Gem, title: "Custom Programmable IP", description: "A single-owner collection for standalone works, with full licensing and provenance attached." },
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
            Tokenization and monetization, at enterprise scale
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schools, festivals, publishers, and rights holders use Medialane to issue, license,
            and monetize intellectual property, and to participate directly in worldwide creator
            capital markets. Fully managed, low-cost, and secured by immutable contracts for
            compliance you can point to.
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
            The same operating properties every asset on Medialane gets, applied to your business.
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

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">More ways to build value</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MORE_CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
