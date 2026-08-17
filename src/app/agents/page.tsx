import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Bot, Zap, KeyRound, Code2, ArrowRight } from "lucide-react"

const FLOW = [
  {
    icon: KeyRound,
    title: "Headless authentication",
    description: "Any agent with a Starknet keypair authenticates, provisions credits, and calls the API on its own.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Zap,
    title: "x402-native, pay-per-call",
    description: "Machine-payable IP access over the x402 protocol lets an agent pay for what it uses, per call, the moment it needs it.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Code2,
    title: "Machine-readable capabilities",
    description: "Action descriptions in the service registry are structured JSON, the same registry the UI itself reads.",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
]

export default function AgentsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Bot className="w-3.5 h-3.5 mr-1.5 inline" />
            AI Agents
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            x402-native, machine-payable IP access
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An agent authenticates, provisions credits, and calls the API on the same fee schedule
            as a human integrator.
          </p>
          <Button asChild size="lg" className="px-10">
            <a href="https://docs.medialane.io/docs/agents" target="_blank" rel="noopener noreferrer">
              Read the agent quickstart
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {FLOW.map(({ icon: Icon, title, description, color, bg }, i) => (
              <div key={title} className="flex items-center flex-1 gap-3">
                <div className="flex-1 rounded-xl border border-border bg-foreground/5 backdrop-blur-sm p-6 space-y-3">
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Agents run on the same registry human integrators use, at the same pricing. See the full API surface.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/developers">View developer docs</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
