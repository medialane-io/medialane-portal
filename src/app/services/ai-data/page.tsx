import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";
import { BERNE_COUNTRIES } from "@/lib/site";

const title = "AI data licensing";
const description =
  "Set what AI systems may do with your catalog, with license terms and provenance that travel with every asset, and be paid when they use it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/ai-data"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Solutions",
  title: "License your catalog for AI, and be paid per use",
  description:
    "Medialane provides the provenance, the license terms and the payment rail. You get a verifiable record of authorship and terms, and a way to be paid when AI systems use your catalog.",
  cta: { label: "Register a catalog", href: "/launchpad/data-tokenization" },
  blocks: [
    { eyebrow: "Provenance", title: "A record you can point to", description: `Every asset carries an immutable record of authorship and license terms, built for the Berne Convention, which covers ${BERNE_COUNTRIES} countries. Anyone can verify it, for the asset's whole life.` },
    { eyebrow: "AI policy", title: "Allowed, Training Only or Not Allowed", description: "You decide per work or per collection, and the choice is part of the asset's record." },
    { eyebrow: "Payment", title: "Paid when your catalog is used", description: "The machine-payable rail AI agents use to pay for access works in reverse: you are paid per call, when your content is used." },
    { eyebrow: "The other side", title: "The same rail an agent pays through", description: "An agent authenticates and calls the API on the same usage-based payment system, so your catalog and their access meet on one layer." },
  ],
  secondaryCta: {
    eyebrow: "AI agents",
    title: "See the agent side",
    description: "An agent authenticates, provisions credits and calls the API on the same terms as a person.",
    href: "/agents",
    ctaLabel: "See the agent side",
  },
};

export default function ServicesAiDataPage() {
  return <ServiceDetailPage content={content} />;
}
