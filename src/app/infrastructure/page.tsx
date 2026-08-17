import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { BackgroundGradients } from "@/src/components/background-gradients"
import { Puzzle, Wallet, Layers, GitBranch } from "lucide-react"

const PILLARS = [
  {
    icon: Layers,
    title: "Register a service, not a fork",
    description: "Medialane's service registry is open-ended — adding a new product type is a registry entry, not a schema migration or a marketplace fork.",
  },
  {
    icon: Puzzle,
    title: "Ship a UI variant",
    description: "Each registered service declares its capabilities and asset shape; your interface reads from the same registry Medialane's own apps consume.",
  },
  {
    icon: Wallet,
    title: "Embed working product surfaces",
    description: "Media Wallet — Medialane's own self-custody wallet — is built as a modular component designed to embed in other apps, not just stand alone. Integrating means reusing shipped product surfaces, not rebuilding them.",
  },
  {
    icon: GitBranch,
    title: "Stay interoperable",
    description: "Assets follow OpenSea-compatible ERC-721/1155 metadata standards — what you build on Medialane's registry isn't locked to Medialane's own apps.",
  },
]

export default function InfrastructurePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Infrastructure
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Don&apos;t build a tokenization stack
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Register a service, get a UI variant, ship — the same open-ended registry
            Medialane&apos;s own apps run on.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map(({ icon: Icon, title, description }) => (
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
            Infrastructure partnerships are sales-led — tell us what you&apos;re building.
          </p>
          <Button asChild size="lg">
            <Link href="/enterprise">Talk to us</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
