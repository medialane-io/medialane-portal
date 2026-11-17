import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Credentials for organizations";
const description =
  "Passes, certificates and tickets for members, students and attendees, tamper-proof and issued from your own wallet.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/tokenize"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Solutions",
  title: "Credentials people can trust",
  description:
    "Every credential is tamper-proof and owned directly by the person holding it, always available to them.",
  cta: { label: "Talk to us", href: "/contact" },
  blocks: [
    { eyebrow: "Schools and organizations", title: "Digital passes and certificates", description: "Give members, students or attendees a tamper-proof credential, ready to use with nothing to download." },
    { eyebrow: "Direct settlement", title: "Direct settlement", description: "Payments settle directly through the smart contracts, between you and the other party." },
    { eyebrow: "In your control", title: "Issued from your wallet", description: "You approve every issue with your passkey, and the transactions are sponsored for you." },
    { eyebrow: "Your own product", title: "Or build it in", description: "Issue credentials inside your own product through the API, with your own screens on top." },
  ],
};

export default function ServicesTokenizePage() {
  return <ServiceDetailPage content={content} />;
}
