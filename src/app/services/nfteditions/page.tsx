import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Limited Editions";
const description =
  "Controlled-supply releases and timed drops. Release a work in as many numbered copies as you choose, each carrying the same provenance back to the original.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/nfteditions"),
  ...buildSocialMetadata({ title, description, imageAlt: "Limited Editions" }),
};

const content: ServiceDetailContent = {
  title: "Scarcity you actually control",
  description:
    "Two live services cover this: numbered editions of an existing work, and timed drops of a new one.",
  blocks: [
    { title: "Numbered copies, set by you", description: "Release a work in as many numbered copies as you choose. Fans collect and trade them; every copy carries the same provenance back to your original." },
    { eyebrow: "Collection Drop", title: "A timed release with a price and a window", description: "Set a price, a supply, and a start and end time. Collectors purchase directly from a branded drop page on their own schedule." },
  ],
};

export default function ServicesNftEditionsPage() {
  return <ServiceDetailPage content={content} />;
}
