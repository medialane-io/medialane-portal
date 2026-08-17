import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { BackgroundGradients } from "@/src/components/background-gradients"
import { EnterpriseContactForm } from "@/src/components/enterprise-contact-form"
import { Ticket, GraduationCap, Newspaper, ShieldCheck } from "lucide-react"

const DEPLOYMENT_TYPES = [
  {
    icon: GraduationCap,
    title: "Credentials & gated access",
    description: "Issue soulbound passes for gated content, memberships, or attendance — POP Protocol, deployed to your audience with no wallet setup required on their end.",
  },
  {
    icon: Ticket,
    title: "Ticketing",
    description: "Redeemable, tradeable admission via IP Tickets. Assets pre-issued to wallets provisioned for the recipient — a frictionless door, not a crypto onboarding flow.",
  },
  {
    icon: Newspaper,
    title: "Content licensing & AI training",
    description: "Tokenize your content library for licensing, including AI-training use, with a provenance-verified, Berne-aligned audit trail.",
  },
  {
    icon: ShieldCheck,
    title: "Managed creator payouts",
    description: "Medialane administers licensing payments to your underlying creators on your behalf — you keep the relationship, we handle distribution.",
  },
]

export default function EnterprisePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Enterprise
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Deploy credentials, tickets, and licensed content on verifiable rails
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            For schools, festivals, publishers, and rights holders — sales-led engagements built on
            live Medialane services, not a self-serve API key.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {DEPLOYMENT_TYPES.map(({ icon: Icon, title, description }) => (
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

        <section className="container mx-auto px-4 pb-24 max-w-xl">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Talk to us</h2>
              <EnterpriseContactForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
