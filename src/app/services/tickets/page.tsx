import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "IP Ticketing";
const description =
  "Tickets with their own supply and validity window, sent to a guest list and checkable against the chain.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/tickets"),
  ...buildSocialMetadata({ title, description, imageAlt: title }),
};

const content: ServiceDetailContent = {
  eyebrow: "Launchpad",
  title: "Tickets your guests can hold and you can verify",
  description:
    "Create a ticket with its own supply and validity window and send it to a guest list. Guests need no app and no account to receive one.",
  cta: { label: "Start a run", href: "/launchpad/ip-ticketing" },
  blocks: [
    { eyebrow: "Supply and validity", title: "Set how many, and when", description: "Each ticket type has its own supply and a start and end time." },
    { eyebrow: "Guest list", title: "Send to a list of people", description: "Add your guests and they each receive a ticket. Anyone without a wallet gets one created for them." },
    { eyebrow: "Transfer", title: "Resale is your call", description: "Let a ticket be passed on, or keep it with its original holder. You choose per ticket." },
    { eyebrow: "At the door", title: "Checked against the chain", description: "A ticket is verified against the chain directly, so there is no separate database that can fall out of sync with what was issued." },
    { eyebrow: "Reusable", title: "One group, many events", description: "Issue new tickets into a group you already created." },
    { eyebrow: "Terms", title: "License terms and AI policy", description: "Every ticket carries its terms, including an AI policy, in its record." },
  ],
  steps: [
    { title: "Choose a group", description: "Use an existing ticket group, or name a new one." },
    { title: "Describe the ticket", description: "Add a name, artwork, a supply and the validity window." },
    { title: "Add your guests", description: "Paste or upload the guest list." },
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

export default function ServicesTicketsPage() {
  return <ServiceDetailPage content={content} />;
}
