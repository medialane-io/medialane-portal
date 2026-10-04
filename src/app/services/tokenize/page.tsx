import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Credentials for organizations";
const description =
  "Passes, certificates and tickets for members, students and attendees that cannot be faked or copied, issued from your own wallet.";

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
    "Every credential is tamper-proof and owned directly by the person holding it. There is nothing for your organization to store and nothing for them to lose.",
  cta: { label: "Talk to us", href: "/contact" },
  blocks: [
    { eyebrow: "Schools and organizations", title: "Digital passes and certificates", description: "Give members, students or attendees a credential that cannot be faked or copied. There is nothing for them to download or set up." },
    { eyebrow: "Direct settlement", title: "No intermediary", description: "Payments settle directly through the smart contracts, between you and the other party. Medialane holds no funds and pays no one on your behalf." },
    { eyebrow: "In your control", title: "Issued from your wallet", description: "You approve every batch with your passkey. Medialane sponsors the transactions but never holds your keys." },
    { eyebrow: "Your own product", title: "Or build it in", description: "Run issuance inside your own product through the API, with your own screens on top." },
  ],
  secondaryCta: {
    eyebrow: "Infrastructure",
    title: "Tokenization inside your product",
    description: "Add ready-made capabilities and design the screens your customers see.",
    href: "/infrastructure",
    ctaLabel: "See infrastructure",
  },
};

export default function ServicesTokenizePage() {
  return <ServiceDetailPage content={content} />;
}
