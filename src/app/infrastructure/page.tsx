import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Puzzle, Wallet, Layers, GitBranch } from "lucide-react"

const STEPS = [
  {
    icon: Layers,
    title: "Register a service",
    description: "Every product type Medialane supports is an entry in a shared registry, not a hardcoded route. Adding a new one is a registry entry, so your integration never breaks when the underlying schema changes.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Puzzle,
    title: "Ship a UI variant",
    description: "Each registered service declares what it can do and what its assets look like. Build your interface against that declaration, and it stays correct as the registry grows.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Wallet,
    title: "Embed working product surfaces",
    description: "Media Wallet, Medialane's own self-custody wallet, is built to embed in other apps. Integrating means reusing a product surface that already works, not building a wallet from scratch.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: GitBranch,
    title: "Stay interoperable",
    description: "Every asset follows the OpenSea-compatible ERC-721/1155 metadata standard. What you build on Medialane's registry works in wallets and marketplaces beyond Medialane's own apps too.",
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
            Add tokenization to your own product without writing the contracts yourself. Register
            what you need in Medialane&apos;s open-ended service registry, and your interface reads
            from the same registry Medialane&apos;s own apps use.
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
