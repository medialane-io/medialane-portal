import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Ticket, GraduationCap, Newspaper, ShieldCheck, Mail } from "lucide-react"

const DEPLOYMENT_TYPES = [
  {
    icon: GraduationCap,
    title: "Credentials & gated access",
    description: "Issue soulbound passes for gated content, memberships, or attendance through POP Protocol. Assets land directly in wallets already provisioned for your audience.",
  },
  {
    icon: Ticket,
    title: "Ticketing",
    description: "Redeemable, tradeable admission via IP Tickets. Assets are pre-issued to wallets provisioned for the recipient, ready to use at the door.",
  },
  {
    icon: Newspaper,
    title: "Content licensing & AI training",
    description: "Tokenize your content library for licensing, including AI-training use, with a provenance-verified, Berne-aligned audit trail.",
  },
  {
    icon: ShieldCheck,
    title: "Managed creator payouts",
    description: "Medialane administers licensing payments to your underlying creators on your behalf, so you keep the relationship while we handle distribution.",
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
            Licensing infrastructure that carries proof
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Today&apos;s AI-content deals run on bilateral contracts, verifiable to the two parties
            that signed them. Medialane gives publishers, schools, festivals, and rights holders
            the same commercial relationships on infrastructure that carries a shared, provenance-verified
            record for every license.
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
            Reach out and tell us what you&apos;re building. We&apos;ll scope it with you.
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
