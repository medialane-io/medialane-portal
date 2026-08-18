"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { UsageTab } from "@/src/components/portal/usage-tab";

export default function AccountUsagePage() {
  const router = useRouter();
  const { session, isLoading } = usePortalAuth();

  if (isLoading) return null;
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">You need to sign in first.</p>
          <Link href="/account" className="text-sm text-primary hover:underline">Go to your account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl pt-28 pb-16">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Account
      </Link>
      <UsageTab address={session.address} onViewCredits={() => router.push("/account/credits")} />
    </div>
  );
}
