import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Data Tokenization";
const description =
  "Register a whole catalog at once. Every item is created in your own collection with authorship, date and license terms recorded permanently.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/data-tokenization"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Launchpad",
  title: "Register a whole catalog at once",
  description:
    "Add the items, set the terms once, and every item is created in your own collection with authorship, date and license terms recorded permanently.",
  cta: { label: "Get started", href: "/launchpad/data-tokenization" },
  blocks: [
    { eyebrow: "Proof", title: "Authorship and date, kept", description: "Each item carries a permanent record of who made it and when, in content-addressed metadata anyone can verify." },
    { eyebrow: "Terms", title: "License terms that travel", description: "License type, commercial use, derivatives, attribution, territory and royalty are recorded with every item." },
    { eyebrow: "AI", title: "An AI policy per item", description: "Choose Allowed, Training Only or Not Allowed. The policy is part of the item's record." },
    { eyebrow: "Your collection", title: "New or existing", description: "Create items in a collection you already own, or start a new one. Everything is issued to your own wallet." },
    { eyebrow: "Saved", title: "Pick it up any time", description: "Your progress is saved, so you can continue exactly where you left off." },
    { eyebrow: "Pricing", title: "Pay for what you use", description: "Each action has a clear price, shown on the pricing page and read live." },
  ],
};

export default function DataTokenizationServicePage() {
  return <ServiceDetailPage content={content} />;
}
