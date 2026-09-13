import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "AI Data & Training";
const description =
  "Turn catalog access for AI training into a recurring revenue line, with license terms and provenance that travel with every asset, compliant with international copyright law.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/ai-data"),
  ...buildSocialMetadata({ title, description, imageAlt: "AI Data & Training" }),
};

const content: ServiceDetailContent = {
  title: "License your catalog for AI, and get paid per use",
  description:
    "Medialane provides the provenance, licensing, and payment rail. What you get is a compliant record of authorship and terms, and a way to be paid, per call, when AI systems use your catalog.",
  blocks: [
    { eyebrow: "Provenance & compliance", title: "A record you can point to, worldwide", description: "Every asset registered on Medialane carries an immutable, on-chain record of authorship and license terms, compliant with international copyright law including the Berne Convention. Provenance and permissions travel with the asset and stay verifiable by anyone, for its entire lifecycle." },
    { eyebrow: "Usage-based payments", title: "Get paid every time your catalog is used", description: "The same machine-payable rail AI agents already use to pay for access, in reverse: you get paid per call, the moment your content is used." },
    { eyebrow: "Licensing", title: "License terms travel with the asset itself", description: "License terms live in the asset's metadata and travel with it. What's allowed for AI training use is set by you, per work or per collection." },
    { eyebrow: "The other side", title: "The same rail an AI agent pays through", description: "An agent authenticates and calls the API on the same usage-based payment system. Your catalog and their access meet on one shared payment layer." },
  ],
  secondaryCta: {
    eyebrow: "AI Agents",
    title: "See the agent side",
    description: "An agent authenticates, provisions credits, and calls the API on the same fee schedule as a human integrator.",
    href: "/agents",
    ctaLabel: "See the agent side",
  },
};

export default function ServicesAiDataPage() {
  return <ServiceDetailPage content={content} />;
}
