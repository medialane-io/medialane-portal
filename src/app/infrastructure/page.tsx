import type { Metadata } from "next";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero } from "@/components/site/page-shell";

const title = "Infrastructure";
const description =
  "Add tokenization to your own product through one API. Tickets, memberships, collections, licensing or a coin, ready-made, with your own interface on top.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/infrastructure"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Infrastructure" }),
};

const BLOCKS = [
  { title: "Pick what to add", description: "Tickets, memberships, collections, licensing or a coin. Each is a ready-made capability." },
  { title: "Connect through one API", description: "Call Medialane's API to issue and manage assets for your product. There are no contracts for you to write, audit or deploy." },
  { title: "Build your own screens", description: "You design the interface your customers see. Medialane runs the tokenization underneath it." },
  { title: "Works beyond your product", description: "Every asset follows the same open format, so it is recognized by other marketplaces and apps." },
];

export default function InfrastructurePage() {
  return (
    <div className="pb-20">
      <PageHero
        title="Power your product with Medialane"
        description="Plug in ready-made tokenization capabilities, on infrastructure Medialane's own products already run on."
      />
      <PageBody>
        <CardGrid columns={4}>
          {BLOCKS.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </CardGrid>
        <LaunchpadCtaBanner
          eyebrow="Working at scale?"
          title="Talk to us about your integration"
          description="Tell us what you are building and what volume you expect."
          href="/contact"
          ctaLabel="Contact us"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
