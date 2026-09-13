import Link from "next/link";
import { LaunchpadCtaBanner } from "@medialane/ui";

const QUICK_LINKS = [
  { label: "How it works", href: "/platform" },
  { label: "Launchpad services", href: "#launchpad-services" },
  { label: "Protect your IP worldwide", href: "#ip-types" },
  { label: "Data compliance for AI", href: "#ai-data" },
];

const LAUNCHPAD_SERVICES = [
  { href: "/services", title: "Originals & Collections", description: "Single-edition NFTs, remixes with automatic attribution, and timed collection drops." },
  { href: "/services/nfteditions", title: "Limited Editions", description: "Numbered copies of one work, released in whatever run size you choose." },
  { href: "/services/tickets", title: "Community", description: "Attendance badges, tickets, membership clubs, and direct sponsorship offers." },
  { href: "/launchpad", title: "Coins", description: "Launch a creator coin with a public trading pool, or claim one you already made." },
  { href: "/services", title: "Marketplace", description: "List, offer, and auction everything issued through the Launchpad. Payment settles the moment a sale completes." },
];

const IP_TYPES = [
  "Audio", "Video", "Art", "Photography", "NFT", "Software", "RWA", "Patents",
  "Posts", "Publications", "Documents", "Custom", "Proof of Participation",
  "Certificates", "Tickets", "Clubs", "Licensing", "Remix", "Sponsorships",
];

const AI_DATA_LABELS = [
  "Provenance and license terms, secured on-chain the moment you register",
  "Automatic copyright protection under the Berne Convention",
  "Paid the moment an AI system uses your catalog",
];

const EXPLORE = [
  { href: "/developers", title: "Developers", description: "Build with our API. Pay only for what you use." },
  { href: "/services/tokenize", title: "Enterprise", description: "Tokenize credentials, IP, tickets, clubs, and limited editions. We handle the technical side." },
  { href: "/infrastructure", title: "Infrastructure", description: "Run tokenization inside your own product, powered by Medialane." },
  { href: "/agents", title: "AI Agents & Data", description: "Agents pay automatically for what they use. Rights holders get paid the same way for AI training access." },
];

export function HomePage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tokenization and monetization</p>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Fast and scalable infrastructure for the creative economy
        </h1>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <section id="launchpad-services" className="space-y-6 scroll-mt-24">
          <h2 className="font-display text-2xl font-bold text-foreground text-center">Launchpad services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LAUNCHPAD_SERVICES.map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-2 block hover:border-primary/60 transition-colors"
              >
                <h3 className="font-display text-lg font-bold text-foreground">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section id="ip-types" className="space-y-6 scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">What can be registered and tokenized?</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Any IP type can be registered and protected. Here&apos;s what Medialane supports today, with an example use case for each.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {IP_TYPES.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm text-foreground"
              >
                {type}
              </span>
            ))}
          </div>
          <div className="text-center">
            <Link href="/services/ip" className="text-sm font-medium text-primary hover:underline">
              See how IP protection works
            </Link>
          </div>
        </section>

        <section id="ai-data" className="space-y-6 scroll-mt-24 max-w-2xl mx-auto text-center">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Data compliance for AI</h2>
            <p className="text-sm text-muted-foreground">Provenance and licensing for AI training data, built compliant</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Register your catalog once and get an immutable, on-chain record of authorship and license terms,
            compliant with international copyright law including the Berne Convention. Provenance and
            permissions travel with every asset and stay verifiable by anyone.
          </p>
          <ul className="space-y-2 text-left inline-block">
            {AI_DATA_LABELS.map((label) => (
              <li key={label} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <div>
            <Link href="/services/ai-data" className="text-sm font-medium text-primary hover:underline">
              See how AI data compliance works
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground text-center">Explore</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPLORE.map((item) => (
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

        <LaunchpadCtaBanner
          eyebrow="Developers"
          title="Hold a key, pay per call"
          description="Every endpoint is priced and metered. Agents pay the same way people do."
          href="/account"
          ctaLabel="Get a key"
          tone="manage"
        />
      </div>
    </div>
  );
}
