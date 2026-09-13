import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Tokenization for IP";
const description =
  "Protect creative work worldwide: proof of authorship in minutes, plus licensing and catalog tracking, including for AI training use.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/ip"),
  ...buildSocialMetadata({ title, description, imageAlt: "Tokenization for IP" }),
};

const content: ServiceDetailContent = {
  title: "Protecting your creative work worldwide",
  description:
    "Ensure the authenticity, timestamping, and immutability of your media assets with blockchain technology. Register creative content, deliverables, contracts, and digital evidence quickly, securely, and with international legal validity.",
  blocks: [
    { eyebrow: "Worldwide compliance", title: "Legal recognition and global backing", description: "Every record receives tamper-proof blockchain verification and legally recognized timestamping, giving your intellectual property solid backing in courtrooms and arbitration." },
    { title: "Global validity in 170+ countries", description: "Your creative assets and media rights are protected across Latin America, North America, Europe, and Asia under international intellectual property frameworks." },
    { title: "Fast, digital workflow", description: "Complete asset registration in under 5 minutes through a streamlined, fully digital interface." },
    { title: "Creative agencies & studios", description: "Protect campaign concepts, pitch decks, client mockups, and final deliverables before sharing them externally." },
    { title: "Production houses & software developers", description: "Timestamp original soundtracks, video edits, script revisions, and proprietary source code with absolute proof of creation date." },
    { title: "Corporate media teams & freelancers", description: "Organize client projects, track asset ownership transfers, and archive digital evidence like email threads or contract approvals." },
    { eyebrow: "How it works, step 1", title: "Start a new record", description: "Onchain with our SDK, or with our apps at medialane.io or starknet.medialane.io." },
    { eyebrow: "How it works, step 2", title: "Set ownership & visibility", description: "Select access permissions, tag co-creators or team members, and upload your files." },
    { eyebrow: "How it works, step 3", title: "Confirm & issue onchain asset", description: "Review your details and finalize. Your file's cryptographic hash is etched onto the blockchain, generating an immutable certificate of ownership." },
  ],
  secondaryCta: {
    eyebrow: "AI Data & Training",
    title: "Your catalog, licensed for AI",
    description: "The same provenance and licensing that protects a single work also covers a whole catalog used for AI training.",
    href: "/services/ai-data",
    ctaLabel: "See AI Data & Training",
  },
};

export default function ServicesIpPage() {
  return <ServiceDetailPage content={content} />;
}
