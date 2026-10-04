import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Certificate Emission";
const description =
  "Issue non-transferable certificates to a list of recipients, who each keep theirs in their own wallet.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/certificates"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Launchpad",
  title: "Certificates people keep and no one can fake",
  description:
    "Create a certificate and send it to a list of recipients. Each one is non-transferable, owned directly by the person it was issued to, and verifiable by anyone.",
  cta: { label: "Start a run", href: "/launchpad/certificate-emission" },
  blocks: [
    { eyebrow: "Non-transferable", title: "Issued to one person", description: "A certificate cannot be sold or passed on. Each recipient keeps the one they are issued." },
    { eyebrow: "Recipients", title: "A wallet for everyone", description: "Recipients without a wallet get one created for them, so there is nothing to download or set up." },
    { eyebrow: "Nothing to store", title: "No database on your side", description: "The record lives onchain with the recipient. There is no file for your organization to keep or for them to lose." },
    { eyebrow: "Reusable", title: "One collection, many issues", description: "Issue more certificates into the same collection later." },
    { eyebrow: "Verifiable", title: "Checked by anyone", description: "Anyone can confirm a certificate against the chain, without asking you." },
    { eyebrow: "Terms", title: "Terms in the record", description: "License terms and an AI policy are recorded with the certificate." },
  ],
  steps: [
    { title: "Choose a collection", description: "Use an existing one, or name a new one." },
    { title: "Describe the certificate", description: "Add a name, a description and artwork." },
    { title: "Add your recipients", description: "Paste or upload the list." },
    { title: "Pay once and run it", description: "Pay with credits or USDC, then approve each batch." },
  ],
  secondaryCta: {
    eyebrow: "Pricing",
    title: "See what a run costs",
    description: "Every action in a run has a price in credits, read live.",
    href: "/pricing",
    ctaLabel: "See pricing",
  },
};

export default function ServicesCertificatesPage() {
  return <ServiceDetailPage content={content} />;
}
