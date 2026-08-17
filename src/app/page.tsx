import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Code2, ArrowRight, Sparkles, Bot, Building2, Blocks, ShieldCheck, LayoutGrid, Globe,
  ImagePlus, Layers, Users, Coins, ShoppingBag,
  Music, Palette, Film, Camera, Gem, Award, FileText, BookOpen, File, Building,
  Fingerprint, BadgeCheck, Ticket, Scale, GitBranch, Handshake,
} from "lucide-react"

const IP_TYPES = [
  { icon: Music, title: "Audio", useCase: "A musician registers a master track before release.", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Film, title: "Video", useCase: "A production house timestamps a script revision and a video edit.", color: "text-red-400", bg: "bg-red-500/10" },
  { icon: Palette, title: "Art", useCase: "An illustrator secures a piece before sharing it with a client.", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Camera, title: "Photography", useCase: "A photographer proves the creation date of a shoot before licensing it.", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Gem, title: "NFT", useCase: "A collector brings an existing collection onto their profile.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Code2, title: "Software", useCase: "A developer timestamps proprietary source code.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Building, title: "RWA", useCase: "A team tokenizes a real-world asset record for tracking.", color: "text-lime-400", bg: "bg-lime-500/10" },
  { icon: Award, title: "Patents", useCase: "An inventor timestamps a patent filing draft before submission.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: FileText, title: "Posts", useCase: "A creator registers a social post before it's shared publicly.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: BookOpen, title: "Publications", useCase: "A publisher timestamps a whitepaper before release.", color: "text-teal-400", bg: "bg-teal-500/10" },
  { icon: File, title: "Documents", useCase: "A freelancer proves the exact date a contract was signed.", color: "text-slate-400", bg: "bg-slate-500/10" },
  { icon: Layers, title: "Custom", useCase: "A team registers any other asset outside the standard categories.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: Fingerprint, title: "Proof of Participation", useCase: "An event issues a permanent badge that can't be transferred or faked.", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  { icon: BadgeCheck, title: "Certificates", useCase: "A rights holder issues a tamper-proof certificate of ownership for a high-value asset.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Ticket, title: "Tickets", useCase: "A festival issues tickets that are verifiable at the door.", color: "text-rose-400", bg: "bg-rose-500/10" },
  { icon: Users, title: "Clubs", useCase: "A brand issues membership cards with tiers for fans, supporters, and press.", color: "text-sky-400", bg: "bg-sky-500/10" },
  { icon: Scale, title: "Licensing", useCase: "A publisher licenses their catalog and tracks usage, including for AI training.", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: GitBranch, title: "Remix", useCase: "A creator publishes a derivative work with attribution and royalties flowing back automatically.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Handshake, title: "Sponsorships", useCase: "A creator takes a direct sponsorship offer in exchange for a license.", color: "text-stone-400", bg: "bg-stone-500/10" },
]

const HUBS = [
  {
    icon: ImagePlus,
    title: "Originals & Collections",
    description: "Single-edition NFTs, remixes with automatic attribution, and timed collection drops.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Layers,
    title: "Limited Editions",
    description: "Numbered copies of one work, released in whatever run size you choose.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Users,
    title: "Community",
    description: "Attendance badges, tickets, membership clubs, and direct sponsorship offers.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: Coins,
    title: "Coins",
    description: "Launch a creator coin with a public trading pool, or claim one you already made.",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "List, offer, and auction everything issued through the Launchpad. Payment settles the moment a sale completes.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
]

const DATA_COMPLIANCE = [
  { value: "Immutable", label: "Provenance and license terms, secured on-chain the moment you register" },
  { value: "181 Countries", label: "Automatic copyright protection under the Berne Convention" },
  { value: "Per call", label: "Paid the moment an AI system uses your catalog" },
]

const SERVICE_LINES = [
  {
    icon: Code2,
    title: "Developers",
    description: "Build with our API. Pay only for what you use.",
    href: "/developers",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
    border: "border-brand-blue/20",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description: "Tokenize credentials, IP, tickets, clubs, and limited editions. We handle the technical side.",
    href: "/enterprise",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
    border: "border-brand-orange/20",
  },
  {
    icon: Blocks,
    title: "Infrastructure",
    description: "Run tokenization inside your own product, powered by Medialane.",
    href: "/infrastructure",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    border: "border-brand-purple/20",
  },
  {
    icon: Bot,
    title: "AI Agents & Data",
    description: "Agents pay automatically for what they use. Rights holders get paid the same way for AI training access.",
    href: "/agents",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
    border: "border-brand-maeve/20",
  },
]

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-24 pb-16 max-w-5xl text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Tokenization for business
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            Medialane
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn what you own into digital assets you can license, sell, and track.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/platform">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                How it works
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/services">
                <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                Launchpad services
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/enterprise/ip">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Protect your IP worldwide
              </Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Five hubs, thirteen live services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {HUBS.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="space-y-3">
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">What can be registered and tokenized?</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Any IP type can be registered and protected. Here&apos;s what Medialane supports
            today, with an example use case for each.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {IP_TYPES.map(({ icon: Icon, title, useCase, color, bg }) => (
              <div key={title} className="space-y-2">
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{useCase}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/enterprise/ip">
                See how IP protection works
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <Card className="border-border bg-foreground/5 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 md:p-10 space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="space-y-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
                    Data compliance for AI
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Provenance and licensing for AI training data, built compliant
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Register your catalog once and get an immutable, on-chain record of authorship
                    and license terms, compliant with international copyright law including the
                    Berne Convention. Provenance and permissions travel with every asset and stay
                    verifiable by anyone.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
                {DATA_COMPLIANCE.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/enterprise/ai-data">
                  See how AI data compliance works
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICE_LINES.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={href} href={href} className="group">
                <Card className="border-border bg-foreground/5 backdrop-blur-sm h-full transition-all group-hover:border-foreground/20">
                  <CardContent className="p-8 space-y-4">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
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
