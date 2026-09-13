import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Clubs";
const description =
  "Tiered membership programs issued as tradeable cards: fans, supporters, press, and season passes, sold like any collection.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/club"),
  ...buildSocialMetadata({ title, description, imageAlt: "Clubs" }),
};

const content: ServiceDetailContent = {
  title: "Membership that outlasts one event",
  description:
    "Built on IP Club, live on Medialane today. Membership cards your community owns directly, ready to use everywhere.",
  blocks: [
    { eyebrow: "Membership tiers", title: "Fans, supporters, press, season passes", description: "Set up as many membership tiers as you need, each issued as its own card. One club, several ways to belong to it." },
    { eyebrow: "Ongoing access", title: "Not a single event, a standing relationship", description: "A club membership can carry an optional validity window, so it renews or expires on your own terms." },
    { eyebrow: "Monetization", title: "Trade like any collection", description: "Membership cards list, sell, and resell on the Marketplace the same way any other asset does." },
  ],
};

export default function ServicesClubPage() {
  return <ServiceDetailPage content={content} />;
}
