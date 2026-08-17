import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Bot, Zap, ScrollText, Mail, ArrowLeft, ArrowRight } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: Zap,
    eyebrow: "Usage-based payments",
    color: "bg-brand-orange",
    title: "Get paid every time your catalog is used",
    description: "The same machine-payable rail AI agents already use to pay for access, in reverse: you get paid per call, the moment your content is used.",
  },
  {
    icon: ScrollText,
    eyebrow: "Licensing",
    color: "bg-brand-rose",
    title: "License terms travel with the asset itself",
    description: "License terms live in the asset's metadata and travel with it. What's allowed for AI training use is set by you, per work or per collection.",
  },
  {
    icon: Bot,
    eyebrow: "The other side",
    color: "bg-brand-maeve",
    title: "The same rail an AI agent pays through",
    description: "An agent authenticates and calls the API on the same usage-based payment system. Your catalog and their access meet on one shared payment layer.",
  },
]

export default function AiDataPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            AI Data & Training
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            License your catalog for AI, and get paid per use
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Medialane provides the licensing and payment rail. What you get is a way to be paid,
            per call, when AI systems use your catalog.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <FeatureRowList items={ITEMS} />
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/enterprise"><ArrowLeft className="w-4 h-4 mr-1.5" />All Enterprise services</Link>
          </Button>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="mailto:dao@medialane.org"><Mail className="w-4 h-4 mr-2" />dao@medialane.org</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/agents">See the agent side<ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
