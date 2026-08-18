import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Bot, Zap, KeyRound, Code2, ArrowRight } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: KeyRound,
    eyebrow: "Headless authentication",
    color: "bg-brand-blue",
    title: "An agent authenticates on its own",
    description: "Any agent with a Starknet keypair authenticates, provisions credits, and calls the API entirely on its own.",
  },
  {
    icon: Zap,
    eyebrow: "x402, pay-per-call",
    color: "bg-brand-orange",
    title: "Pay for what you use, the moment you use it",
    description: "Machine-payable access over the x402 protocol. It's the same rail enterprises use to get paid for AI training access to their catalogs, on the other side of the same transaction.",
  },
  {
    icon: Code2,
    eyebrow: "Machine-readable",
    color: "bg-brand-maeve",
    title: "The same registry the UI reads",
    description: "Action descriptions in the service registry are structured JSON an agent can call directly.",
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
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            x402-native, machine-payable IP access
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An agent authenticates, provisions credits, and calls the API on the same fee schedule
            as a human integrator.
          </p>
          <Button asChild variant="gradient-fill" className="from-brand-rose to-brand-orange px-10" size="lg">
            <a href="https://docs.medialane.io/docs/agents" target="_blank" rel="noopener noreferrer">
              Read the agent quickstart
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <FeatureRowList items={ITEMS} />
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            x402 runs both directions: agents pay for access, and rights holders get paid the
            same way when their catalog is used for AI training.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="gradient-border" className="pair-rose-orange" size="lg">
              <Link href="/developers">View developer docs</Link>
            </Button>
            <Button asChild variant="gradient-border" className="pair-rose-orange" size="lg">
              <Link href="/enterprise/ai-data">See the rights-holder side<ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
