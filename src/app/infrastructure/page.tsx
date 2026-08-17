import { Badge } from "@/src/components/ui/badge"
import { ListChecks, Plug, LayoutTemplate, Globe2 } from "lucide-react"

const STEPS = [
  {
    icon: ListChecks,
    title: "Pick what you want to add",
    description: "Tickets, memberships, collections, licensing, or a coin. Each is a ready-made capability you can add directly.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Plug,
    title: "Connect through one API",
    description: "Call Medialane's API to issue and manage assets for your product. No contracts to write, audit, or deploy yourself.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: LayoutTemplate,
    title: "Build your own screens",
    description: "You design the interface your customers see. Medialane runs the tokenization underneath it, out of view.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: Globe2,
    title: "Works beyond your product",
    description: "Every asset follows the same industry-standard format, recognized by other marketplaces and apps across the industry.",
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
            Power your product with Medialane&apos;s tokenization platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plug in ready-made tokenization capabilities. Ship in days on infrastructure
            Medialane&apos;s own products already run on.
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
      </div>
    </div>
  )
}
