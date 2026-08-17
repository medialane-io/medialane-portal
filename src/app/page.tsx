import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, ArrowRight, Sparkles, Bot, Building2, Blocks } from "lucide-react"

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
    description: "Tokenize credentials, tickets, or a content library. We handle the technical side.",
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
    title: "AI Agents",
    description: "Let AI agents pay for access automatically, per request.",
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

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 leading-tight">
            Medialane
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn what you own into digital assets you can license, sell, and track.
          </p>
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
