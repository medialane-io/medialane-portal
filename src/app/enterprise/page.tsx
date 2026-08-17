import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Ticket, GraduationCap, Newspaper, ShieldCheck, Mail } from "lucide-react"

const DEPLOYMENT_TYPES = [
  {
    icon: GraduationCap,
    title: "Digital passes",
    description: "Give members, students, or attendees a pass that can't be faked or copied. Nothing for them to download or set up.",
  },
  {
    icon: Ticket,
    title: "Event tickets",
    description: "Tickets that show up ready to use, ahead of time, and can be resold safely if plans change.",
  },
  {
    icon: Newspaper,
    title: "Content licensing",
    description: "Turn your catalog into something you can license and track, including for AI use.",
  },
  {
    icon: ShieldCheck,
    title: "Payouts, handled",
    description: "We pay your creators or partners on your behalf. You keep the relationship, we handle the paperwork.",
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

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {DEPLOYMENT_TYPES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border bg-foreground/5 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
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
