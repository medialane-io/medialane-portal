import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { GraduationCap, ShieldCheck, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: GraduationCap,
    eyebrow: "Schools & organizations",
    color: "bg-brand-blue",
    title: "Digital passes",
    description: "Give members, students, or attendees a pass that can't be faked or copied. Nothing for them to download or set up.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Publishers & rights holders",
    color: "bg-brand-maeve",
    title: "Payouts, handled",
    description: "We pay your creators or partners on your behalf. You keep the relationship, we handle the paperwork.",
  },
]

export default function TokenizeEnterprisePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Tokenization for Enterprise
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Credentials people can trust
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every credential is immutable and self-custodied by the person holding it. Nothing
            for your organization to store, and nothing for them to lose.
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
            <Button asChild size="lg">
              <a href="mailto:dao@medialane.org"><Mail className="w-4 h-4 mr-2" />dao@medialane.org</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
