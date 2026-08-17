import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, ArrowRight, Sparkles, Bot, Building2, Blocks } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const SERVICE_LINES = [
  {
    icon: Code2,
    title: "Developers",
    description: "Typed, metered access to the full protocol — assets, orders, licensing, drops, real-time events. No gatekeeping, usage-priced.",
    href: "/developers",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description: "Issue credentials, tickets, or gated access on verifiable rails — or tokenize a content library for licensing and AI-training, with Medialane administering creator payouts.",
    href: "/enterprise",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: Blocks,
    title: "Infrastructure",
    description: "Don't build a tokenization stack. Register a service, get a UI variant, ship — the same registry Medialane's own apps run on.",
    href: "/infrastructure",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "x402-native, machine-payable IP access. An agent authenticates, provisions credits, and calls the API — zero human interaction required.",
    href: "/agents",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
]

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-24 pb-16 max-w-5xl text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Protocol infrastructure for licensed intellectual property
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Medialane
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The businesses, integrators, and AI agents that build on Medialane use the API, deploy
            enterprise services, embed the registry as infrastructure, or transact as agents.
            Find your path below.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICE_LINES.map(({ icon: Icon, title, description, href, color, bg, border }) => (
              <Link key={href} href={href} className="group">
                <Card className={`${border} ${bg} backdrop-blur-sm h-full transition-all group-hover:border-white/20`}>
                  <CardContent className="p-8 space-y-4">
                    <Icon className={`w-8 h-8 ${color}`} />
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                    <div className="flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
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
