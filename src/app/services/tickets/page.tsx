import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { ServiceDetailPage, type ServiceDetailContent } from "@/components/services/service-detail-page";

const title = "Tickets";
const description =
  "Verifiable, resellable admission tickets for festivals and event brands, issued at scale with their own supply and validity window, checkable at the door.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services/tickets"),
  ...buildSocialMetadata({ title, description, imageAlt: "Tickets" }),
};

const content: ServiceDetailContent = {
  title: "Tickets your audience can hold and trust",
  description:
    "Built on IP Tickets, live on Medialane today. No app to install, no separate account to create.",
  blocks: [
    { eyebrow: "Festivals & event brands", title: "Tickets that show up ready to use", description: "Every ticket has its own supply and validity window, and is verifiable at the door, ahead of time." },
    { eyebrow: "Resale", title: "Resold safely if plans change", description: "A ticket can be set to trade freely or stay with its original holder. You choose the policy per event." },
    { eyebrow: "At the door", title: "Verifiable, no app required for you to build", description: "Attendance checks against the chain directly. There's no separate database that can fall out of sync with what was actually sold." },
  ],
};

export default function ServicesTicketsPage() {
  return <ServiceDetailPage content={content} />;
}
