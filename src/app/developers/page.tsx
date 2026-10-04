import type { Metadata } from "next";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section, StepList } from "@/components/site/page-shell";
import { DOCS_URL } from "@/lib/site";

const title = "Developers";
const description =
  "A typed SDK, a service registry and one metered API for every live service: registration, licensing, minting, marketplace orders, metadata and onchain activity.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/developers"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Developers" }),
};

const STEPS = [
  { title: "Sign in and get a key", description: "Sign in with your email and a passkey, then create an API key from your account. You can hold up to five." },
  { title: "Add credits", description: "Buy credits with USDC. Every call your keys make is paid from them, and they are shared by all your keys." },
  { title: "Read the service registry", description: "Every service is described as structured data, so there is no per-route behavior to guess at." },
  { title: "Call the API or sign an intent", description: "Reads return indexed data. Writes return calldata for you to sign, so your key never leaves your device." },
];

const ENDPOINTS = [
  { title: "Metadata", description: "Upload and resolve metadata for any asset, including license terms, AI policy and provenance." },
  { title: "Launch and mint", description: "Deploy collections and mint assets programmatically, with ready-to-sign calldata." },
  { title: "Collections and tokens", description: "Collection metadata, token inventories and ownership, indexed from the chain." },
  { title: "Onchain activity", description: "Mints, transfers, sales, offers and cancellations, indexed as they happen." },
  { title: "Marketplace orders", description: "Query listings, bids and completed sales, and sign trade intents with your own wallet." },
  { title: "Tickets and clubs", description: "Issue and query tickets and membership cards, with full holder history." },
  { title: "Sponsorship", description: "Bids and licenses settled directly when a deal is accepted, with no escrow." },
  { title: "Creator coins", description: "Deploy and track fixed-supply creator coins." },
];

const CALLERS = [
  { title: "Businesses", description: "Run Launchpad services on your credits, or call the same capabilities from your own systems." },
  { title: "AI agents", description: "Authenticate headlessly with a keypair and pay per call over x402, at the same prices as a person." },
];

export default function DevelopersPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="One API for the whole protocol"
        description="One API covers every live service. Sign in, get a key and start building. Paid per call, on the same rail businesses and AI agents both use."
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the docs
          </a>
        </div>
      </PageHero>

      <PageBody>
        <Section title="Get building in four steps">
          <StepList steps={STEPS} />
        </Section>

        <Section title="Every live service, one API">
          <CardGrid columns={4}>
            {ENDPOINTS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Built for every caller" description="The same registry and the same API, two ways in.">
          <CardGrid columns={2}>
            {CALLERS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <LaunchpadCtaBanner
          eyebrow="Get started"
          title="Sign in and get a key"
          description="Create an API key and add credits from your account."
          href="/account"
          ctaLabel="Go to your account"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
