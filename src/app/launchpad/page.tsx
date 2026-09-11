"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { launchpadServices } from "@/src/lib/services";
import { PriceCalculator } from "@/src/components/portal/price-calculator";

export default function LaunchpadPage() {
  const { session, isLoading } = usePortalAuth();
  const services = launchpadServices();

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
    <div className="container mx-auto px-4 max-w-5xl pt-28 pb-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Launchpad</h1>
        <p className="mt-2 text-muted-foreground">
          Pick what you are issuing. You give a list of people, everyone gets an account,
          a wallet, and the asset.
        </p>
      </div>

      <div className="mb-10">
        <PriceCalculator />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/launchpad/${service.id}`}
            className="group rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-border"
          >
            <p className="font-semibold">{service.displayName}</p>
            <span className="mt-4 inline-flex items-center text-sm text-primary">
              Open
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
