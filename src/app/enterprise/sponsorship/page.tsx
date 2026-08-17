import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Handshake, ShieldCheck, Gavel, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: Handshake,
    eyebrow: "Direct settlement",
    color: "bg-brand-blue",
    title: "Sponsor an asset, receive a license",
    description: "A sponsor bids on an asset you own; you accept; they receive a license and payment moves directly between the two of you. No escrow holding funds in between.",
  },
  {
    icon: Gavel,
    eyebrow: "Open or invited",
    color: "bg-brand-orange",
    title: "Open bidding, or one invited sponsor",
    description: "Run it as an open offer anyone can bid on, or start a deal with one sponsor directly. Either side can propose the terms.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Owner-verified",
    color: "bg-brand-rose",
    title: "Only the owner can accept",
    description: "Only the asset's owner can accept a bid, and the license mints atomically the moment they do, on-chain.",
  },
]

export default function SponsorshipPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Sponsorship
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Let a sponsor back your work directly
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on IP Sponsorship, live on Medialane today: a song, an artwork, or a patent can
            take a sponsorship offer in exchange for a license, settled asset-to-asset.
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
