import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Code2, ArrowRight, Sparkles, Bot, Building2, Blocks, ShieldCheck, LayoutGrid,
  ImagePlus, Layers, Users, Coins, ShoppingBag,
} from "lucide-react"

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
    description: "List, offer, and auction everything issued through the Launchpad. Direct settlement, no escrow.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
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
    description: "Add tokenization to your own product without building it from scratch.",
    href: "/infrastructure",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    border: "border-brand-purple/20",
  },
  {
    icon: Bot,
    title: "AI Agents & Data",
    description: "Agents pay per call over x402. Rights holders get paid the same way for AI training access.",
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
