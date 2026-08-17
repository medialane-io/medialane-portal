import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { BackgroundGradients } from "@/src/components/background-gradients"
import { Bot, Zap, KeyRound, Code2, ArrowRight } from "lucide-react"

const CAPABILITIES = [
  {
    icon: KeyRound,
    title: "Headless authentication",
    description: "Any agent with a Starknet keypair authenticates, provisions credits, and calls the API — zero human interaction required.",
  },
  {
    icon: Zap,
    title: "x402-native, pay-per-call",
    description: "Machine-payable IP access over the x402 protocol. No subscription, no human approval step — an agent pays for what it uses, per call.",
  },
  {
    icon: Code2,
    title: "Machine-readable capabilities",
    description: "Action descriptions in the service registry are structured JSON, not human-only docs — an agent reads the same registry the UI does.",
  },
]

export default function AgentsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Bot className="w-3.5 h-3.5 mr-1.5 inline" />
            AI Agents
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            x402-native, machine-payable IP access
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An agent authenticates, provisions credits, and calls the API — no human interaction,
            no different fee schedule than a human integrator.
          </p>
          <Button asChild size="lg" className="px-10">
            <a href="https://docs.medialane.io/docs/agents" target="_blank" rel="noopener noreferrer">
              Read the agent quickstart
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Same credits, same pricing, same registry as human integrators — see the full API surface.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/developers">View developer docs</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
