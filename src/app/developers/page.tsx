import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "Developers";
const description =
  "A typed SDK, a service registry, and one metered API for every live service on the protocol: marketplace orders, collections, minting, metadata, and on-chain activity.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/developers"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Developers" }),
};

const STEPS = [
  { eyebrow: "Step 1", title: "Sign in, get an API key", description: "Any Starknet keypair works, human or agent. Provision credits and issue a key from your account dashboard." },
  { eyebrow: "Step 2", title: "Read the service registry", description: "Every service, mip-erc721, ip-erc721, drop-collection, ip-tickets, ip-club, ip-sponsorship, creator-coin, and more, is described as structured JSON. No hardcoded per-route behavior to guess at." },
  { eyebrow: "Step 3", title: "Call the API or sign an intent", description: "Read endpoints return indexed data directly. Write actions return ready-to-sign calldata; your key never leaves your device." },
];

const ENDPOINTS = [
  { title: "Marketplace Orders", description: "Query active listings, bids, and completed sales. Filter by contract, token, or wallet." },
  { title: "Collections & Drops", description: "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources." },
  { title: "Launch & Mint", description: "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment." },
  { title: "Decentralized Metadata", description: "Resolve full metadata for any token, including license terms, remix history, and provenance." },
  { title: "Onchain Activity", description: "Stream every event, from mints and transfers to sales, offers, and cancellations, indexed in real time." },
  { title: "Trade Intents", description: "Sign a buy or sell order with your wallet, keeping your private key on your own device. Submit it for direct settlement." },
  { title: "Tickets & Clubs", description: "Issue and query redeemable tickets and tiered membership cards, per-creator factories with full holder history." },
  { title: "Sponsorship", description: "Direct-settlement sponsorship bids and licenses, no escrow, settled the moment a deal closes." },
  { title: "Creator Coins", description: "Deploy and track fixed-supply creator coins, Ekubo-only, ownership renounced at launch." },
];

const CALLERS = [
  { title: "Business", description: "Fully managed tokenization and monetization for schools, festivals, publishers, and rights holders." },
  { title: "AI Agents", description: "Headless authentication and x402 pay-per-call access, the same fee schedule as a human integrator." },
];

export default function DevelopersPage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          One API for the whole protocol
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          One API covers every live service: minting, marketplace orders,
          licensing, drops, tickets, clubs, sponsorship, and coins. Sign in
          to get a key and start building. Paid over x402, per call, the
          same rail enterprises and AI agents both use.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground text-center">Get building in three steps</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{step.eyebrow}</p>
                <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground text-center">Every live service, one API</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ENDPOINTS.map((endpoint) => (
              <div key={endpoint.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <h3 className="font-display text-lg font-bold text-foreground">{endpoint.title}</h3>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Built for every caller</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              The same registry and the same API, three different ways in.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {CALLERS.map((caller) => (
              <div key={caller.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
                <h3 className="font-display text-lg font-bold text-foreground">{caller.title}</h3>
                <p className="text-sm text-muted-foreground">{caller.description}</p>
              </div>
            ))}
          </div>
        </section>

        <LaunchpadCtaBanner
          eyebrow="Developers"
          title="Sign in & get access"
          description="Any Starknet keypair works, human or agent. Provision credits and issue a key from your account dashboard."
          href="/account"
          ctaLabel="Sign in & get access"
          tone="manage"
        />
      </div>
    </div>
  );
}
