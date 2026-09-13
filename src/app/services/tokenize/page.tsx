import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Tokenization for Enterprise";
const description =
  "Digital passes and credentials for schools and organizations that can't be faked or copied, with payouts handled on your behalf.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/tokenize"),
  ...buildSocialMetadata({ title, description, imageAlt: "Tokenization for Enterprise" }),
};

const content: ServiceDetailContent = {
  title: "Credentials people can trust",
  description:
    "Every credential is tamper-proof and owned directly by the person holding it. Nothing for your organization to store, and nothing for them to lose.",
  blocks: [
    { eyebrow: "Schools & organizations", title: "Digital passes", description: "Give members, students, or attendees a pass that can't be faked or copied. Nothing for them to download or set up." },
    { eyebrow: "Publishers & rights holders", title: "Payouts, handled", description: "We pay your creators or partners on your behalf. You keep the relationship, we handle the paperwork." },
  ],
};

export default function ServicesTokenizePage() {
  return <ServiceDetailPage content={content} />;
}
