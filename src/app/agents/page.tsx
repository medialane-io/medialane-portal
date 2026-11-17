import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero } from "@/components/site/page-shell";

const title = "AI agents";
const description =
  "AI agents get direct access to the same services as people, on the same terms.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/agents"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane for AI agents" }),
};

const BLOCKS = [
  { eyebrow: "Headless authentication", title: "An agent signs in on its own", description: "Any agent with a Starknet keypair can sign in and call the API by itself." },
  { eyebrow: "x402, pay per call", title: "Pay for what you use, when you use it", description: "Machine-payable access over the x402 protocol. It is the rail rights holders use to be paid for AI access to their catalogs, from the other side of the same transaction." },
  { eyebrow: "Machine-readable", title: "A registry an agent can read", description: "Services and their actions are described as structured data an agent can call directly." },
];

export default function AgentsPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="AI agents"
        description="AI agents get direct access to the same services as people, on the same terms."
      />
      <PageBody>
        <CardGrid columns={3}>
          {BLOCKS.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </CardGrid>
      </PageBody>
    </div>
  );
}
