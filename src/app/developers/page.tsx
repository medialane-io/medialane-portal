import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section, StepList } from "@/components/site/page-shell";
import { DOCS_URL } from "@/lib/site";

const title = "Developers";
const description =
  "A typed SDK, a service registry and one API for every live service: registration, licensing, minting, marketplace orders, metadata and onchain activity.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/developers"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Developers" }),
};

const STEPS = [
  { title: "Sign in and get a key", description: "Sign in with your email, then create your API key from your account. An account has one key." },
  { title: "Top up", description: "Add USDC to cover every call your key makes." },
  { title: "Read the service registry", description: "Every service is described as structured data, so behavior is clear before the first call." },
  { title: "Call the API or sign an intent", description: "Reads return indexed data. Writes return ready-to-sign calldata, so your wallet key stays on your device." },
];

const ENDPOINTS = [
  { title: "Metadata", description: "Upload and resolve metadata for any asset, including license terms, AI policy and provenance." },
  { title: "Launch and mint", description: "Deploy collections and mint assets programmatically, with ready-to-sign calldata." },
  { title: "Collections and tokens", description: "Collection metadata, token inventories and ownership, indexed from the chain." },
  { title: "Onchain activity", description: "Mints, transfers, sales, offers and cancellations, indexed as they happen." },
  { title: "Marketplace orders", description: "Query listings, bids and completed sales, and sign trade intents with your own wallet." },
  { title: "Tickets and clubs", description: "Issue and query tickets and membership cards, with full holder history." },
  { title: "Sponsorship", description: "Bids and licenses settled directly when a deal is accepted." },
  { title: "Creator coins", description: "Deploy and track fixed-supply creator coins." },
];

const CALLERS = [
  { title: "Businesses", description: "Use the Launchpad services, or call the same capabilities from your own systems." },
  { title: "AI agents", description: "Authenticate headlessly with a keypair and pay per call over x402, at the same prices as a person." },
];

export default function DevelopersPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="One API for the whole protocol"
        description="One API covers every live service, for businesses and AI agents alike. Sign in, get a key and start building."
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
        <Section title="Get building">
          <StepList steps={STEPS} />
        </Section>

        <Section title="Every live service, one API">
          <CardGrid columns={4}>
            {ENDPOINTS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Built for every caller" description="The same registry and the same API for everyone.">
          <CardGrid columns={2}>
            {CALLERS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

      </PageBody>
    </div>
  );
}
