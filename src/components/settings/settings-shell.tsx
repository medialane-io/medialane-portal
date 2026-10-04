"use client";

import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissingKeyNotice, useMissingKey } from "@/components/wallet/missing-key-notice";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { cn } from "@/lib/utils";
import type { RowStatus, RowTone } from "@/lib/settings/rows";

export function SettingsPage({
  title,
  subtitle,
  back = true,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="container mx-auto max-w-2xl space-y-6 px-4 py-16">
      <header className="space-y-2">
        {back ? (
          <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  );
}

export function SettingsGate({ children }: { children: ReactNode }) {
  const { hasWallet } = useWalletNativeSession();
  const missingKey = useMissingKey();
  if (hasWallet) return <>{children}</>;
  return (
    <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Sign in to manage your account, your devices and how you recover them.
      </p>
      {missingKey ? (
        <MissingKeyNotice returnTo="/settings" />
      ) : (
        <Button asChild className="mt-5">
          <Link href="/connect?redirect_url=/settings">Sign in</Link>
        </Button>
      )}
    </main>
  );
}

export function SettingsGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">{label}</h2>
      <div className="divide-y divide-border border-y border-border">{children}</div>
    </section>
  );
}

const TONE: Record<RowTone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-yellow-700 dark:text-yellow-400",
  muted: "text-muted-foreground",
};

export function SettingsRow({
  href,
  icon: Icon,
  label,
  status,
}: {
  href: string;
  icon: ElementType;
  label: string;
  status?: RowStatus | null;
}) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 py-3 transition-colors hover:text-primary">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {status ? <span className={cn("text-sm", TONE[status.tone])}>{status.value}</span> : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
