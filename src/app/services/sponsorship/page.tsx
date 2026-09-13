import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Sponsorship";
const description =
  "Structured sponsorship deals between a brand and a rights holder, settled automatically the moment a sponsor's bid is accepted, no escrow.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/sponsorship"),
  ...buildSocialMetadata({ title, description, imageAlt: "Sponsorship" }),
};

const content: ServiceDetailContent = {
  title: "Let a sponsor back your work directly",
  description:
    "Built on IP Sponsorship, live on Medialane today: a song, an artwork, or a patent can take a sponsorship offer in exchange for a license, settled asset-to-asset.",
  blocks: [
    { eyebrow: "Direct settlement", title: "Sponsor an asset, receive a license", description: "A sponsor bids on an asset you own; you accept; they receive a license and payment settles directly between the two of you, the moment the deal is accepted." },
    { eyebrow: "Open or invited", title: "Open bidding, or one invited sponsor", description: "Run it as an open offer anyone can bid on, or start a deal with one sponsor directly. Either side can propose the terms." },
    { eyebrow: "Owner-verified", title: "Only the owner can accept", description: "Only the asset's owner can accept a bid, and the license issues automatically the moment they do." },
  ],
};

export default function ServicesSponsorshipPage() {
  return <ServiceDetailPage content={content} />;
}
