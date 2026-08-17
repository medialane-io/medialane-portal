import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Layers, Package, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: Layers,
    eyebrow: "Limited Editions",
    color: "bg-brand-purple",
    title: "Numbered copies, set by you",
    description: "Release a work in as many numbered copies as you choose. Fans collect and trade them; every copy carries the same provenance back to your original.",
  },
  {
    icon: Package,
    eyebrow: "Collection Drop",
    color: "bg-brand-blue",
    title: "A timed release with a price and a window",
    description: "Set a price, a supply, and a start and end time. Collectors purchase directly from a branded drop page on their own schedule.",
  },
]

export default function EditionsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Limited Editions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Scarcity you actually control
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Two live services cover this: numbered editions of an existing work, and timed drops
            of a new one.
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
