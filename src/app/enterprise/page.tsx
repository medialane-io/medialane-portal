import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Ticket, GraduationCap, Newspaper, ShieldCheck, Mail } from "lucide-react"

const DEPLOYMENT_TYPES = [
  {
    icon: GraduationCap,
    audience: "Schools & organizations",
    title: "Digital passes",
    description: "Give members, students, or attendees a pass that can't be faked or copied. Nothing for them to download or set up.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Ticket,
    audience: "Festivals & event brands",
    title: "Event tickets",
    description: "Tickets that show up ready to use, ahead of time, and can be resold safely if plans change.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Newspaper,
    audience: "Publishers & rights holders",
    title: "Content licensing",
    description: "Turn your catalog into something you can license and track, including for AI use.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: ShieldCheck,
    audience: "Publishers & rights holders",
    title: "Payouts, handled",
    description: "We pay your creators or partners on your behalf. You keep the relationship, we handle the paperwork.",
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
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
            Passes, tickets, and licenses people can trust
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schools, festivals, publishers, and rights holders use Medialane to issue and license
            digital assets. No blockchain experience needed on your end, or your audience&apos;s.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02]">
            {DEPLOYMENT_TYPES.map(({ icon: Icon, audience, title, description, color, bg }, i) => (
              <div
                key={title}
                className={`flex items-start gap-5 px-6 py-6 ${i < DEPLOYMENT_TYPES.length - 1 ? "border-b border-border/50" : ""}`}
              >
                <div className={`h-12 w-12 shrink-0 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${color} mb-1`}>{audience}</p>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
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
