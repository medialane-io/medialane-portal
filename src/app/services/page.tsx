import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "Services";
const description =
  "Every way to tokenize and monetize on Medialane: originals and collections, limited editions, community badges and tickets, membership clubs, sponsorships, and creator coins.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Services" }),
};

const GROUPS = [
  {
    heading: "Originals",
    items: [
      { href: "/services/ip", title: "Single Edition NFTs", description: "Publish any photo, video, audio, or document, minted once inside your collection. Licensing, provenance, and ownership live on-chain." },
      { href: "/services/ip", title: "Remix Asset", description: "Create a licensed derivative of another work. Attribution and royalties flow back to the original creator automatically." },
      { href: "/services/nfteditions", title: "Collection Drop", description: "Set a price, a supply, and a start and end time. Collectors mint directly from your branded drop page." },
      { href: "/services/nfteditions", title: "Limited Editions", description: "Create an editions collection and release each work in as many numbered copies as you choose." },
    ],
  },
  {
    heading: "Community",
    items: [
      { href: "/services/tickets", title: "POP Protocol", description: "Give out permanent badges. Each person can claim one, and it cannot be transferred or faked." },
      { href: "/services/tickets", title: "IP Tickets", description: "Create tickets with their own supply and validity window. Every ticket is verifiable on-chain at the door." },
      { href: "/services/club", title: "IP Club", description: "Create a club with membership tiers, fans, supporters, press, season passes. Mint the cards and sell them like any collection." },
      { href: "/services/sponsorship", title: "IP Sponsorship", description: "Let a sponsor back your work directly, for a license in return. Payment settles directly between sponsor and author." },
    ],
  },
  {
    heading: "Coins",
    items: [
      { href: "/launchpad", title: "Creator Coin", description: "Launch your own coin with a public trading pool. You set the supply and allocation and stay in control of the liquidity." },
      { href: "/launchpad", title: "Claim Memecoin", description: "Add a coin you already launched to list it on the Coins page and your profile." },
    ],
  },
];

const USE_CASES = [
  { eyebrow: "Game studios & esports orgs", title: "Reward tournament wins, sell season memberships", description: "Hand out a permanent badge the moment a player wins, and sell tiered fan memberships for the season alongside it." },
  { eyebrow: "Museums & galleries", title: "Certify a physical piece, sell numbered prints", description: "Mint a certificate of authenticity for a physical work, then release numbered print editions of it with the same provenance attached." },
  { eyebrow: "Podcast & media networks", title: "Take direct sponsor deals, launch a listener coin", description: "Settle sponsorship payments directly with a brand for a season of episodes, and give your audience a coin of their own to trade." },
  { eyebrow: "Nonprofits & causes", title: "Prove participation, keep the record permanent", description: "Issue a non-transferable badge to every donor or volunteer, a record that can't be faked, sold, or lost." },
  { eyebrow: "Sample libraries & stock catalogs", title: "License a catalog, get paid every time it's reused", description: "Publish a catalog once and get paid automatically each time a piece is licensed or remixed, no invoicing required." },
];

export default function ServicesPage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          One Launchpad for everything you issue
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ten live services across four groups. The Launchpad grows by adding
          new ones alongside what&apos;s already running.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        {GROUPS.map((group) => (
          <section key={group.heading} className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground text-center">{group.heading}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-border/60 bg-card p-6 space-y-2 block hover:border-primary/60 transition-colors"
                >
                  <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </a>
              ))}
            </div>
          </section>
        ))}

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">How teams put this to work</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              A few of the services above, combined for a real deployment.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <div key={useCase.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{useCase.eyebrow}</p>
                <h3 className="font-display text-lg font-bold text-foreground">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        <LaunchpadCtaBanner
          eyebrow="Marketplace"
          title="Every asset issued through the Launchpad can trade here"
          description="Payment and asset move in one transaction, or neither moves. There's no escrow holding funds in between."
          href="/developers"
          ctaLabel="See the API"
          tone="manage"
        />
      </div>
    </div>
  );
}
