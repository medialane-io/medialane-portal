import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section } from "@/components/site/page-shell";
import { DOCS_URL } from "@/lib/site";

const title = "Infrastructure";
const description =
  "Add ownership, licensing and monetization to your own products through one API: collections, drops, tickets, memberships, certificates, sponsorship and a marketplace, with your own interface on top.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/infrastructure"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Infrastructure" }),
};

const BUILDING_BLOCKS = [
  { title: "Collections and editions", description: "Single works, numbered editions and whole catalogs, each carrying its own license terms and AI policy." },
  { title: "Drops", description: "Timed releases with a price, a supply and an optional allowlist, shared through personal claim links." },
  { title: "Tickets", description: "Tickets with their own supply and validity window, verified onchain at the door." },
  { title: "Memberships", description: "Tiered membership cards that renew, expire and resell on the terms the organizer sets." },
  { title: "Certificates and badges", description: "Non-transferable certificates and proof-of-participation badges for people who attended, contributed or reached a milestone." },
  { title: "Sponsorship", description: "Brands bid on an asset and receive a license, with payment settled directly with the owner." },
  { title: "Creator coins", description: "Fixed-supply coins with permanently locked liquidity, launched for a creator or a community." },
  { title: "Marketplace", description: "Listings, offers, counter-offers and remix, with creators paid their royalties at every sale." },
];

const FOR_TEAMS = [
  { title: "One API and a typed SDK", description: "Read collections, tokens, orders and activity, and create assets, listings and offers, from any stack." },
  { title: "Your screens, your brand", description: "Design the interface your customers see. Branded collection pages, custom slugs and claim links keep every touchpoint on your identity." },
  { title: "Sign-in your customers know", description: "Customers sign in with email or a wallet, and an account is created for them inside your product." },
  { title: "Approved by the owner", description: "Every action is approved from the customer's own wallet, secured with a passkey, Face ID or Touch ID." },
  { title: "Files and metadata", description: "Upload media and metadata to IPFS and attach license terms and an AI policy to each asset." },
  { title: "Live data", description: "Mints, transfers, sales and offers appear as they happen, ready for portfolios, galleries and token-gated experiences." },
];

const OPEN = [
  { title: "Recognized everywhere", description: "Every asset follows open token standards, so other marketplaces and apps read it the same way." },
  { title: "Open source", description: "The SDK and the contracts are open and auditable on GitHub." },
  { title: "Always compatible", description: "New features join the service registry as the catalog grows, and existing integrations keep working." },
];

export default function InfrastructurePage() {
  return (
    <div className="pb-24">
      <PageHero
        title="Power your products with Programmable IP"
        description="Plug ownership, licensing and monetization into any product through one API and SDK, on the infrastructure that powers our own apps."
      />
      <PageBody>
        <Section title="Building blocks for every kind of work" description="Choose the features a product needs. New ones arrive as the catalog grows.">
          <CardGrid columns={4}>
            {BUILDING_BLOCKS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Made for product teams" description="Everything needed to bring these features to customers under your own name.">
          <CardGrid columns={3}>
            {FOR_TEAMS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Open by design" description="Open standards, open source code and a registry that grows without breaking integrations.">
          <CardGrid columns={3}>
            {OPEN.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <a href={`${DOCS_URL}/dev`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Read the developer docs
            </a>
            <a href="https://github.com/medialane-io/medialane-sdk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              SDK on GitHub
            </a>
          </div>
        </Section>
      </PageBody>
    </div>
  );
}
