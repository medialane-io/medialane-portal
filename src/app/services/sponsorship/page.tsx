import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Sponsorship";
const description =
  "Structured sponsorship deals between a brand and a rights holder, settled directly when a bid is accepted.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/sponsorship"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "On the protocol",
  title: "Let a sponsor back your work directly",
  description: "Available through the API and on medialane.io. A song, an artwork or a patent can take a sponsorship offer in exchange for a license.",
  cta: { label: "See the API", href: "/developers" },
  blocks: [
    { eyebrow: "Direct settlement", title: "Sponsor an asset, receive a license", description: "A sponsor bids on an asset you own and you accept. They receive a license and payment settles directly between the two of you, with no escrow." },
    { eyebrow: "Open or invited", title: "Open bidding, or one sponsor", description: "Run an open offer anyone can bid on, or start a deal with one sponsor. Either side can propose the terms." },
    { eyebrow: "Owner-verified", title: "Only the owner can accept", description: "The license is issued the moment the asset's owner accepts a bid." },
  ],
};

export default function ServicesSponsorshipPage() {
  return <ServiceDetailPage content={content} />;
}
