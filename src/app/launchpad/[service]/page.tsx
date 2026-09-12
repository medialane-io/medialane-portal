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

  if (isLoading || !session) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{service.displayName}</h1>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Checking your wallet</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in with your wallet to issue to a list of people. It signs the run and pays for it.
            </p>
            <Link href="/account" className="mt-4 text-sm text-primary hover:underline">
              Sign in
            </Link>
            <Link href="/launchpad" className="mt-2 text-sm text-muted-foreground hover:underline">
              Back to the Launchpad
            </Link>
          </>
        )}
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
