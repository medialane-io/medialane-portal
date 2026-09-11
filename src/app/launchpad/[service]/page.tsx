"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { launchpadService } from "@/src/lib/services";
import { IssuanceTask } from "@/src/components/portal/issuance-task";
import { TicketsTask } from "@/src/components/portal/tickets-task";
import { isTicketService } from "@/src/lib/issuance-form";

export default function LaunchpadServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: serviceId } = use(params);
  const { session, isLoading } = usePortalAuth();
  const service = launchpadService(serviceId);

  if (!service) notFound();
  if (isLoading) return null;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Sign in to use the Launchpad.</p>
          <Link href="/account" className="text-sm text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {isTicketService(service.id) ? (
        <TicketsTask serviceId={service.id} address={session.address} />
      ) : (
        <IssuanceTask serviceId={service.id} address={session.address} />
      )}
    </div>
  );
}
