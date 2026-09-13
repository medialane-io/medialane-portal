import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "Platform";
const description =
  "One shared, on-chain catalog behind every Medialane product and partner app: immutable contracts, a full replayable history, and the same record no matter which app reads it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/platform"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Platform" }),
};

const RULES = [
  {
    eyebrow: "01 · The rules",
    title: "Set once, in public",
    description:
      "Contracts are immutable and permissionless. Once deployed, they stay exactly as set, including for Medialane itself.",
  },
  {
    eyebrow: "02 · The record",
    title: "Every asset, sale, and license, kept",
    description:
      "The full history is searchable and could be rebuilt from nothing if it ever needed to be, replayed straight from on-chain events.",
  },
  {
    eyebrow: "03 · The connection",
    title: "One shared catalog",
    description:
      "Any product, Medialane's own or a partner's, plugs into the same capabilities and the same catalog through the SDK. Every app built on Medialane, ours or a partner's, reads and writes through the same protocol.",
  },
  {
    eyebrow: "04 · The apps",
    title: "Different views, same record",
    description:
      "Medialane's apps and partner apps are just different ways of using the same underlying record. None of them can bend what it says.",
  },
];

const HUBS = [
  {
    title: "Launchpad",
    description:
      "Create and release something new: a collection, an edition, a membership, a ticket, a sponsorship offer, or a coin for your community.",
  },
  {
    title: "Marketplace",
    description:
      "Buy, sell, and license everything issued on Medialane. A sale pays out the moment it completes, directly between buyer and seller, with no escrow holding funds in between.",
  },
];

export default function PlatformPage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          How Medialane actually works
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tokenization turns something you own into a digital record you can
          trade, license, and verify on Starknet, secured by zero-knowledge
          validity proofs at every step. It&apos;s the same idea behind
          tokenizing real estate or bonds, applied to intellectual property.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Four layers, one system</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Authority only flows down. The chain is the only truth;
              everything above it is a cache, a lens, or a view.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map((rule) => (
              <div key={rule.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{rule.eyebrow}</p>
                <h3 className="font-display text-lg font-bold text-foreground">{rule.title}</h3>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Two hubs</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Everything Medialane does falls into issuing an asset or trading one.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {HUBS.map((hub) => (
              <div key={hub.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <h3 className="font-display text-lg font-bold text-foreground">{hub.title}</h3>
                <p className="text-sm text-muted-foreground">{hub.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-2xl mx-auto text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Coming</p>
          <h2 className="font-display text-2xl font-bold text-foreground">Value you can verify</h2>
          <p className="text-sm text-muted-foreground">
            Starknet&apos;s proof system will let Medialane attest to
            real-world facts on-chain: how many times a song streamed, how
            many times an article was cited. As those proofs accumulate, a
            licensed asset&apos;s value becomes something anyone can verify
            for themselves.
          </p>
        </section>

        <LaunchpadCtaBanner
          eyebrow="Launchpad"
          title="See what you can issue and trade today"
          description="View Launchpad services."
          href="/services"
          ctaLabel="View Launchpad services"
          tone="manage"
        />
      </div>
    </div>
  );
}
