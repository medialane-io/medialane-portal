import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  Building2, ScrollText, Ticket, Handshake, Users, Layers, Bot, Mail, ArrowRight,
} from "lucide-react"

const UMBRELLAS = [
  {
    icon: Building2,
    title: "Tokenization for Enterprise",
    description: "Credentials, digital passes, and payouts handled on your behalf.",
    href: "/enterprise/tokenize",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: ScrollText,
    title: "Tokenization for IP",
    description: "Protect creative work worldwide: proof of authorship in minutes, plus licensing and catalog tracking, including for AI use.",
    href: "/enterprise/ip",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
]

const MONETIZATION = [
  { icon: Ticket, title: "Tickets", href: "/enterprise/tickets", color: "text-brand-rose", bg: "bg-brand-rose/10" },
  { icon: Users, title: "Clubs", href: "/enterprise/clubs", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
  { icon: Layers, title: "Limited Editions", href: "/enterprise/editions", color: "text-brand-purple", bg: "bg-brand-purple/10" },
  { icon: Handshake, title: "Sponsorship", href: "/enterprise/sponsorship", color: "text-brand-blue", bg: "bg-brand-blue/10" },
  { icon: Bot, title: "AI Data & Training", href: "/enterprise/ai-data", color: "text-brand-orange", bg: "bg-brand-orange/10" },
]

export default function EnterprisePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Enterprise
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Tokenization and monetization, on your terms
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schools, festivals, publishers, and rights holders use Medialane to issue, license,
            and monetize digital assets. No blockchain experience needed on your end, or your
            audience&apos;s.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {UMBRELLAS.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={href} href={href} className="group">
                <Card className="border-border bg-foreground/5 backdrop-blur-sm h-full transition-all group-hover:border-foreground/20">
                  <CardContent className="p-8 space-y-4">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
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

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Monetization services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MONETIZATION.map(({ icon: Icon, title, href, color, bg }) => (
              <Link key={href} href={href} className="group text-center space-y-2">
                <div className={`h-14 w-14 mx-auto rounded-full ${bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Tell us what you&apos;re building. We&apos;ll help you get started.
          </p>
          <Button asChild size="lg">
            <a href="mailto:dao@medialane.org">
              <Mail className="w-4 h-4 mr-2" />
              dao@medialane.org
            </a>
          </Button>
        </section>
      </div>
    </div>
  )
}
