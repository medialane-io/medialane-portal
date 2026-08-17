import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import { Signature, Newspaper, Bot, Mail, ArrowLeft } from "lucide-react"

const ITEMS: FeatureRowItem[] = [
  {
    icon: Signature,
    eyebrow: "Proof of Authorship",
    color: "bg-brand-orange",
    title: "Timestamp any file on-chain, in minutes",
    description: "Images, video, audio, documents, and code. Protection is automatic under the Berne Convention in 181 countries the moment you create something; tokenizing on Medialane gives you the on-chain, timestamped evidence to point to.",
  },
  {
    icon: Newspaper,
    eyebrow: "Publishers & rights holders",
    color: "bg-brand-rose",
    title: "Content licensing",
    description: "Turn your catalog into something you can license and track, including for AI training use.",
  },
  {
    icon: Bot,
    eyebrow: "AI-ready",
    color: "bg-brand-maeve",
    title: "Get paid when AI uses your catalog",
    description: "License your catalog for AI training access over x402, the same pay-per-call rail AI agents already use.",
  },
]

export default function TokenizeIpPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Tokenization for IP
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Minutes to protect, forever to prove
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Berne Convention protection is automatic from the moment you create something.
            Medialane adds the on-chain, timestamped evidence you can point to when it matters.
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
