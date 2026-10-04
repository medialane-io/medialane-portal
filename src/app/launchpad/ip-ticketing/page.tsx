import { Suspense } from "react";
import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { IpTicketingTask } from "@/components/launchpad/ip-ticketing-task";

export const metadata: Metadata = {
  title: "IP Ticketing",
  description: "Create verifiable on-chain tickets and distribute them to a list of recipients in one run.",
  alternates: canonical("/launchpad/ip-ticketing"),
};

export default function IpTicketingPage() {
  return (
    <Suspense fallback={null}>
      <IpTicketingTask />
    </Suspense>
  );
}
