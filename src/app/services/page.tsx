import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  ImagePlus, Layers, GitBranch, Award, Package, Ticket, Users, Handshake,
  Coins, TrendingUp, ShoppingBag, ArrowRight, Gamepad2, Landmark, Mic2, HeartHandshake,
} from "lucide-react"

interface ServiceCard {
  icon: typeof ImagePlus
  title: string
  description: string
  color: string
  bg: string
}

interface ServiceGroup {
  key: string
  title: string
  tagline: string
  services: ServiceCard[]
}

const GROUPS: ServiceGroup[] = [
  {
    key: "nfts",
    title: "Originals",
    tagline: "Singular works, your own collections, timed drops, and remixes.",
    services: [
      { icon: ImagePlus, title: "Single Edition NFTs", description: "Publish any photo, video, audio, or document, minted once inside your collection. Licensing, provenance, and ownership live on-chain.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
      { icon: GitBranch, title: "Remix Asset", description: "Create a licensed derivative of another work. Attribution and royalties flow back to the original creator automatically.", color: "text-brand-rose", bg: "bg-brand-rose/10" },
      { icon: Package, title: "Collection Drop", description: "Set a price, a supply, and a start and end time. Collectors mint directly from your branded drop page.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
    ],
  },
  {
    key: "limited-editions",
    title: "Limited Editions",
    tagline: "Numbered copies of your work.",
    services: [
      { icon: Layers, title: "Limited Editions", description: "Create an editions collection and release each work in as many numbered copies as you choose.", color: "text-brand-purple", bg: "bg-brand-purple/10" },
    ],
  },
  {
    key: "community",
    title: "Community",
    tagline: "Badges, tickets, memberships, and direct sponsorship.",
    services: [
      { icon: Award, title: "POP Protocol", description: "Give out permanent badges. Each person can claim one, and it cannot be transferred or faked.", color: "text-brand-maeve", bg: "bg-brand-maeve/10" },
      { icon: Ticket, title: "IP Tickets", description: "Create tickets with their own supply and validity window. Every ticket is verifiable on-chain at the door.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
      { icon: Users, title: "IP Club", description: "Create a club with membership tiers, fans, supporters, press, season passes. Mint the cards and sell them like any collection.", color: "text-brand-orange", bg: "bg-brand-orange/10" },
      { icon: Handshake, title: "IP Sponsorship", description: "Let a sponsor back your work directly, for a license in return. Payment settles directly between sponsor and author.", color: "text-brand-rose", bg: "bg-brand-rose/10" },
    ],
  },
  {
    key: "coins",
    title: "Coins",
    tagline: "Launch your own coin, or bring one you already made.",
    services: [
      { icon: TrendingUp, title: "Creator Coin", description: "Launch your own coin with a public trading pool. You set the supply and allocation and stay in control of the liquidity.", color: "text-brand-purple", bg: "bg-brand-purple/10" },
      { icon: Coins, title: "Claim Memecoin", description: "Add a coin you already launched to list it on the Coins page and your profile.", color: "text-brand-blue", bg: "bg-brand-blue/10" },
    ],
  },
]

const MARKETPLACE_FEATURES = [
  "List an asset for sale",
  "Make or accept an offer",
  "Run an auction",
  "License or remix with attribution",
]

interface UseCase {
  icon: typeof Gamepad2
  eyebrow: string
  title: string
  description: string
  services: string[]
  color: string
  bg: string
}

const USE_CASES: UseCase[] = [
  {
    icon: Gamepad2,
    eyebrow: "Game studios & esports orgs",
    title: "Reward tournament wins, sell season memberships",
    description: "Hand out a permanent badge the moment a player wins, and sell tiered fan memberships for the season alongside it.",
    services: ["POP Protocol", "IP Club"],
    color: "text-brand-maeve",
    bg: "bg-brand-maeve/10",
  },
  {
    icon: Landmark,
    eyebrow: "Museums & galleries",
    title: "Certify a physical piece, sell numbered prints",
    description: "Mint a certificate of authenticity for a physical work, then release numbered print editions of it with the same provenance attached.",
    services: ["Single Edition NFTs", "Limited Editions"],
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Mic2,
    eyebrow: "Podcast & media networks",
    title: "Take direct sponsor deals, launch a listener coin",
    description: "Settle sponsorship payments directly with a brand for a season of episodes, and give your audience a coin of their own to trade.",
    services: ["IP Sponsorship", "Creator Coin"],
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: HeartHandshake,
    eyebrow: "Nonprofits & causes",
    title: "Prove participation, keep the record permanent",
    description: "Issue a non-transferable badge to every donor or volunteer, a record that can't be faked, sold, or lost.",
    services: ["POP Protocol"],
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
  {
    icon: GitBranch,
    eyebrow: "Sample libraries & stock catalogs",
    title: "License a catalog, get paid every time it's reused",
    description: "Publish a catalog once and get paid automatically each time a piece is licensed or remixed, no invoicing required.",
    services: ["Remix Asset", "Collection Drop"],
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
]

export default function ServicesPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Launchpad
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            One Launchpad for everything you issue
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ten live services across four groups. The Launchpad grows by adding new ones
            alongside what&apos;s already running.
          </p>
        </section>

        {GROUPS.map((group) => (
          <section key={group.key} className="container mx-auto px-4 pb-16 max-w-5xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">{group.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{group.tagline}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.services.map(({ icon: Icon, title, description, color, bg }) => (
                <Card key={title} className="bg-foreground/5 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">How teams put this to work</h2>
            <p className="text-sm text-muted-foreground mt-1">
              A few of the services above, combined for a real deployment.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map(({ icon: Icon, eyebrow, title, description, services, color, bg }) => (
              <Card key={title} className="bg-foreground/5 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground/70">{eyebrow}</p>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {services.map((service) => (
                      <span
                        key={service}
                        className="text-xs font-medium text-foreground/70 bg-foreground/5 rounded-full px-2.5 py-1"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <Card className="bg-foreground/5 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-brand-rose/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-rose" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Marketplace</h2>
                <p className="text-sm text-muted-foreground">
                  Every asset issued through the Launchpad can trade here. Payment and asset move
                  in one transaction, or neither moves. There&apos;s no escrow holding funds in between.
                </p>
                <Button asChild variant="gradient-fill" className="from-brand-blue to-brand-orange">
                  <Link href="/developers">
                    See the API
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <ul className="space-y-2">
                {MARKETPLACE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-rose shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
