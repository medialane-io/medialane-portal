import type { Metadata } from "next";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero } from "@/components/site/page-shell";
import { DOCS_URL } from "@/lib/site";

const title = "AI agents";
const description =
  "Headless authentication and pay-per-call access over x402, on the same prices as a person, so agents can authenticate, provision credits and call the API on their own.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/agents"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane for AI agents" }),
};

const BLOCKS = [
  { eyebrow: "Headless authentication", title: "An agent signs in on its own", description: "Any agent with a Starknet keypair authenticates, provisions credits and calls the API without a person in the loop." },
  { eyebrow: "x402, pay per call", title: "Pay for what you use, when you use it", description: "Machine-payable access over the x402 protocol. It is the rail rights holders use to be paid for AI access to their catalogs, from the other side of the same transaction." },
  { eyebrow: "Machine-readable", title: "The same registry the apps read", description: "Services and their actions are described as structured data an agent can call directly." },
];

export default function AgentsPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="AI agents"
        description="An agent authenticates, provisions credits and calls the API on the same prices as a person."
      />
      <PageBody>
        <CardGrid columns={3}>
          {BLOCKS.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </CardGrid>
        <LaunchpadCtaBanner
          eyebrow="Documentation"
          title="Read the API docs"
          description="Everything an agent or an integrator needs to start calling the API."
          href={DOCS_URL}
          ctaLabel="Open the docs"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
