"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePortalSession, usePortalSpend } from "@/hooks/use-portal-account";
import { labelForAction } from "@/lib/spend-labels";
import { ApiKeys } from "./api-keys";
import { HowItWorks } from "./how-it-works";
import { AddCredits } from "@/components/funding/add-credits";
import { Button } from "@/components/ui/button";
import { SecuritySummary } from "@/components/settings/security-summary";
import { MissingKeyNotice, useMissingKey } from "@/components/wallet/missing-key-notice";

const CREDITS_PER_USDC = 100;

function usd(credits: number): string {
  const amount = credits / CREDITS_PER_USDC;
  if (amount === 0) return "$0";
  if (amount < 0.01) return "under $0.01";
  return `$${amount.toFixed(2)}`;
}

export function AccountContent() {
  const { signedIn, account, ready, hasWallet, error, refresh: refreshAccount } = usePortalSession();
  const { data: spend } = usePortalSpend(signedIn);
  const missingKey = useMissingKey();

  useEffect(() => {
    if (!signedIn || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [signedIn]);

  if (!ready) return null;

  if (!signedIn && hasWallet) {
    if (!error) return null;
    return (
      <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-3 text-sm text-muted-foreground">Couldn&apos;t load your account.</p>
        <Button className="mt-5" onClick={() => refreshAccount()}>
          Retry
        </Button>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to see your credits, your key and what you have spent.
        </p>
        {missingKey ? (
          <MissingKeyNotice returnTo="/account" />
        ) : (
          <Button asChild className="mt-5">
            <Link href="/connect">Sign in</Link>
          </Button>
        )}
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl space-y-10 px-4 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Your key, and the credits it spends.</p>
      </header>

      <HowItWorks />

      <ApiKeys />

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">Credits</p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {account ? account.creditBalance.toLocaleString() : "—"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {account ? usd(account.creditBalance) : "Loading"}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Credits pay for every request your key makes.
        </p>
      </section>

      {spend && spend.byAction.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">What you have spent on</h2>
          <ul className="divide-y divide-border/40">
            {spend.byAction.map((row) => (
              <li key={row.actionKey} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">{labelForAction(row.actionKey)}</span>
                <span className="tabular-nums">{row.credits.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SecuritySummary />

      <AddCredits balance={account?.creditBalance} onCredited={() => refreshAccount()} />
    </main>
  );
}
