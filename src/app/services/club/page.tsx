import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Clubs";
const description = "Tiered membership programs issued as cards the member owns.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/club"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "On the protocol",
  title: "Membership that outlasts one event",
  description: "Available through the API and on medialane.io. Membership cards your community owns directly, ready to use anywhere.",
  cta: { label: "See the API", href: "/developers" },
  blocks: [
    { eyebrow: "Tiers", title: "As many as you need", description: "Set up membership tiers such as supporters, press and season passes, each issued as its own card." },
    { eyebrow: "Validity", title: "Renews or expires on your terms", description: "A membership can carry an optional validity window." },
    { eyebrow: "Monetization", title: "Sold like any collection", description: "Membership cards can be listed and resold the way any other asset can." },
  ],
};

export default function ServicesClubPage() {
  return <ServiceDetailPage content={content} />;
}
