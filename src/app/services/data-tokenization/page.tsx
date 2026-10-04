import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Data Tokenization";
const description =
  "Register a whole catalog in one run. Every item is minted to your own collection with authorship, date and license terms recorded permanently.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/data-tokenization"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Launchpad",
  title: "Register a whole catalog in one run",
  description:
    "Add up to 500 items, set the terms once, and every item is minted to your own collection with authorship, date and license terms recorded permanently.",
  cta: { label: "Start a run", href: "/launchpad/data-tokenization" },
  blocks: [
    { eyebrow: "Proof", title: "Authorship and date, kept", description: "Each item carries a permanent record of who made it and when, in content-addressed metadata anyone can verify." },
    { eyebrow: "Terms", title: "License terms that travel", description: "License type, commercial use, derivatives, attribution, territory and royalty are recorded with every item." },
    { eyebrow: "AI", title: "An AI policy per item", description: "Choose Allowed, Training Only or Not Allowed. The policy is part of the item's record." },
    { eyebrow: "Your collection", title: "New or existing", description: "Mint into a collection you already own, or create one as part of the run. Everything is issued to your own wallet." },
    { eyebrow: "Resumable", title: "Pick it up any time", description: "A run is saved. If a batch is interrupted, resume where it stopped instead of starting over." },
    { eyebrow: "Priced by action", title: "Pay for what the run does", description: "Each upload and mint has a price in credits, shown on the pricing page and read live." },
  ],
  steps: [
    { title: "Choose a collection", description: "Pick one you own, or name a new one." },
    { title: "Add your catalog", description: "Add the items and their files, with a name, a type and optional traits for each." },
    { title: "Pay once", description: "Pay with credits, or with USDC from your wallet." },
    { title: "Approve each batch", description: "Run it, approving every batch with your passkey." },
  ],
  secondaryCta: {
    eyebrow: "Pricing",
    title: "See what a run costs",
    description: "Every action in a run has a price in credits, read live.",
    href: "/pricing",
    ctaLabel: "See pricing",
  },
};

export default function DataTokenizationServicePage() {
  return <ServiceDetailPage content={content} />;
}
