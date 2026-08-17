import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Puzzle, Wallet, Layers, GitBranch } from "lucide-react"

const STEPS = [
  {
    icon: Layers,
    title: "Register a service",
    description: "Medialane's service registry is open-ended. Adding a new product type is a registry entry, keeping your integration decoupled from schema migrations.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Puzzle,
    title: "Ship a UI variant",
    description: "Each registered service declares its capabilities and asset shape. Your interface reads from the same registry Medialane's own apps consume.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Wallet,
    title: "Embed working product surfaces",
    description: "Media Wallet, Medialane's own self-custody wallet, is built as a modular component designed to embed in other apps. Integrating means reusing shipped product surfaces.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: GitBranch,
    title: "Stay interoperable",
    description: "Assets follow OpenSea-compatible ERC-721/1155 metadata standards. What you build on Medialane's registry travels freely beyond Medialane's own apps.",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
]

export default function InfrastructurePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Infrastructure
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Build on a registry, ship in days
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Register a service, get a UI variant, and ship on the same open-ended registry
            Medialane&apos;s own apps run on.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <div className="relative">
            {STEPS.map(({ icon: Icon, title, description, color, bg }, i) => (
              <div key={title} className="relative flex gap-5 pb-10 last:pb-0">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                )}
                <div className={`relative z-10 h-10 w-10 shrink-0 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="pt-1.5">
                  <p className="text-xs font-mono text-muted-foreground mb-1">Step {i + 1}</p>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Tell us what you&apos;re building and we&apos;ll help you get started.
          </p>
          <Button asChild size="lg">
            <Link href="/enterprise">Talk to us</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
