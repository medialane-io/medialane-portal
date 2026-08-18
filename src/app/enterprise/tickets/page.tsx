import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Ticket, ShieldCheck, Repeat, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: Ticket,
    eyebrow: "Festivals & event brands",
    color: "bg-brand-rose",
    title: "Tickets that show up ready to use",
    description: "Every ticket has its own supply and validity window, and is verifiable at the door, ahead of time.",
  },
  {
    icon: Repeat,
    eyebrow: "Resale",
    color: "bg-brand-blue",
    title: "Resold safely if plans change",
    description: "A ticket can be set to trade freely or stay with its original holder. You choose the policy per event.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "At the door",
    color: "bg-brand-orange",
    title: "Verifiable, no app required for you to build",
    description: "Attendance checks against the chain directly. There's no separate database that can fall out of sync with what was actually sold.",
  },
]

export default function TicketsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Tickets
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Tickets your audience can hold and trust
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on IP Tickets, live on Medialane today. No app to install, no separate account
            to create.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <FeatureRowList items={ITEMS} />
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/enterprise"><ArrowLeft className="w-4 h-4 mr-1.5" />All Enterprise services</Link>
          </Button>
          <div>
            <Button asChild variant="gradient-fill" className="from-brand-blue to-brand-maeve" size="lg">
              <a href="mailto:dao@medialane.org"><Mail className="w-4 h-4 mr-2" />dao@medialane.org</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
