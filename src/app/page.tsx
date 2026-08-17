import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, ArrowRight, Sparkles, Bot, Building2, Blocks } from "lucide-react"

const SERVICE_LINES = [
  {
    icon: Code2,
    title: "Developers",
    description: "Typed, metered access to the full protocol: assets, orders, licensing, drops, real-time events. Usage-priced from the first call.",
    href: "/developers",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
    border: "border-brand-blue/20",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description: "Issue credentials, tickets, or gated access on verifiable rails. Tokenize a content library for licensing and AI training, with Medialane administering creator payouts.",
    href: "/enterprise",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
    border: "border-brand-orange/20",
  },
  {
    icon: Blocks,
    title: "Infrastructure",
    description: "Register a service, get a UI variant, and ship on the same registry Medialane's own apps run on.",
    href: "/infrastructure",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    border: "border-brand-purple/20",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "x402-native, machine-payable IP access. An agent authenticates, provisions credits, and calls the API on its own.",
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
            Protocol infrastructure for licensed intellectual property
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 leading-tight">
            Medialane
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every business building on Medialane finds its own path in: the API for integrators,
            enterprise deployments for publishers and institutions, embedded infrastructure for
            partners, and agent-native access for AI. Find yours below.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICE_LINES.map(({ icon: Icon, title, description, href, color, bg, border }) => (
              <Link key={href} href={href} className="group">
                <Card className={`${border} ${bg} backdrop-blur-sm h-full transition-all group-hover:border-foreground/20`}>
                  <CardContent className="p-8 space-y-4">
                    <Icon className={`w-8 h-8 ${color}`} />
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
