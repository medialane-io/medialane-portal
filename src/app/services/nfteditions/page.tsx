import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Limited editions and drops";
const description =
  "Controlled-supply releases: numbered editions of a work, and timed drops with a price, a supply and a window.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/nfteditions"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "On the protocol",
  title: "Scarcity you control",
  description: "Available through the API and on medialane.io. Two services cover it: numbered editions of an existing work, and timed drops of a new one.",
  cta: { label: "See the API", href: "/developers" },
  blocks: [
    { title: "Numbered copies, set by you", description: "Release a work in as many numbered copies as you choose. Every copy carries the same provenance back to your original." },
    { eyebrow: "Collection drop", title: "A timed release", description: "Set a price, a supply and a start and end time. Collectors purchase directly from a branded drop page on their own schedule." },
  ],
};

export default function ServicesNftEditionsPage() {
  return <ServiceDetailPage content={content} />;
}
