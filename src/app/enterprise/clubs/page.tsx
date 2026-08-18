import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Users, LayoutList, ShoppingBag, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: LayoutList,
    eyebrow: "Membership tiers",
    color: "bg-brand-maeve",
    title: "Fans, supporters, press, season passes",
    description: "Set up as many membership tiers as you need, each issued as its own card. One club, several ways to belong to it.",
  },
  {
    icon: Users,
    eyebrow: "Ongoing access",
    color: "bg-brand-blue",
    title: "Not a single event, a standing relationship",
    description: "A club membership can carry an optional validity window, so it renews or expires on your own terms.",
  },
  {
    icon: ShoppingBag,
    eyebrow: "Monetization",
    color: "bg-brand-orange",
    title: "Trade like any collection",
    description: "Membership cards list, sell, and resell on the Marketplace the same way any other asset does.",
  },
]

export default function ClubsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Clubs
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Membership that outlasts one event
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on IP Club, live on Medialane today. Membership cards your community owns
            directly, ready to use everywhere.
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
