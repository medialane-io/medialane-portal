import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";
import { BERNE_COUNTRIES } from "@/lib/site";

const title = "IP protection";
const description =
  "A permanent, verifiable record of authorship and date for creative work, with license terms and an AI policy attached.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/ip"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Solutions",
  title: "A record of authorship you can point to",
  description: `Copyright under the Berne Convention applies automatically in ${BERNE_COUNTRIES} countries. A record gives you a permanent, verifiable account of who made a work and when, with the terms attached.`,
  cta: { label: "Register work", href: "/launchpad/data-tokenization" },
  blocks: [
    { eyebrow: "Built for Berne", title: "Immutable by design", description: "Authorship and ownership claims live in content-addressed, immutable metadata, permanently verifiable." },
    { eyebrow: "Terms", title: "License and AI policy", description: "Choose the license, commercial use, derivatives, territory and royalty, and whether AI may use the work." },
    { eyebrow: "Speed", title: "Under five minutes", description: "Register an asset through a fully digital flow." },
    { eyebrow: "Agencies and studios", title: "Before you share it", description: "Record campaign concepts, pitch decks and final deliverables before they leave your hands." },
    { eyebrow: "Production and software", title: "Proof of creation date", description: "Timestamp soundtracks, edits, scripts and source code." },
    { eyebrow: "Media teams and freelancers", title: "Keep the evidence", description: "Organize client work and archive digital evidence such as approvals and agreements." },
  ],
};

export default function ServicesIpPage() {
  return <ServiceDetailPage content={content} />;
}
