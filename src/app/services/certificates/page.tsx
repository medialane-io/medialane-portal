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
  title: "Certificates people keep, verified by anyone",
  description:
    "Create a certificate and send it to a list of recipients. Each one is non-transferable, owned directly by the person it was issued to, and verifiable by anyone.",
  cta: { label: "Get started", href: "/launchpad/certificate-emission" },
  blocks: [
    { eyebrow: "Non-transferable", title: "Issued to one person", description: "Each certificate stays with the person it was issued to." },
    { eyebrow: "Recipients", title: "A wallet for everyone", description: "Recipients without a wallet get one created for them, ready to use right away." },
    { eyebrow: "Onchain", title: "Kept with the recipient", description: "The record lives onchain with the recipient, always available to them and to anyone who checks it." },
    { eyebrow: "Reusable", title: "One collection, many issues", description: "Issue more certificates into the same collection later." },
    { eyebrow: "Verifiable", title: "Checked by anyone", description: "Anyone can confirm a certificate directly against the chain." },
    { eyebrow: "Terms", title: "Terms in the record", description: "License terms and an AI policy are recorded with the certificate." },
  ],
};

export default function ServicesCertificatesPage() {
  return <ServiceDetailPage content={content} />;
}
