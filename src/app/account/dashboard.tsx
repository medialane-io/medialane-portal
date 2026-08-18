"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Key, Layers, Repeat, BarChart2, Coins, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/src/hooks/use-wallet";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { Button } from "@/src/components/ui/button";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { BuyCreditsDialog } from "@/src/components/portal/buy-credits-dialog";

interface Props {
  address: string;
}

interface ApiKey {
  id: string;
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
}

interface CreditsData {
  data?: { balance?: number; history?: unknown[] };
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Key;
  color: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className={`rounded-2xl border ${color} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function SectionLink({
  href,
  icon: Icon,
  color,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Key;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-4 rounded-2xl border ${color} p-5 transition-colors hover:bg-accent/30`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="w-4 h-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function AccountDashboard({ address }: Props) {
  const router = useRouter();
  const { disconnect } = useWallet();
  const { signOut } = usePortalAuth();
  const [depositOpen, setDepositOpen] = useState(false);

  const { data: keysData } = useSWR<{ data: ApiKey[] }>(`/api/portal/keys?address=${address}`, portalFetcher);
  const { data: creditsData, mutate: mutateCredits } = useSWR<CreditsData>(`/api/portal/credits?address=${address}`, portalFetcher);

  async function handleSignOut() {
    await signOut();
    disconnect();
    router.push("/");
  }

  const keys = keysData?.data ?? [];
  const activeKeys = keys.filter((k) => k.status === "ACTIVE");
  const balance = creditsData?.data?.balance ?? 0;
  const topUps = creditsData?.data?.history?.length ?? 0;
  const treasuryAddress = process.env.NEXT_PUBLIC_STARKNET_X402_TREASURY ?? "";

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl pt-28 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Developer Portal</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Your API account</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Manage the keys, credits, and usage that power your integration with the Medialane API.
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-4">
              Signed in as {address.slice(0, 8)}&hellip;{address.slice(-6)} · Starknet Wallet
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground shrink-0" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl pb-16 space-y-6">
        <div className="rounded-2xl border border-brand-purple/40 p-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Credits balance</p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">credits remaining</p>
          <Button
            variant="gradient-fill"
            className="border-brand-purple/50"
            onClick={() => setDepositOpen(true)}
            disabled={!treasuryAddress}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add credits
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard icon={Key} color="border-brand-blue/40 text-brand-blue" label="Active keys" value={activeKeys.length} />
          <StatCard icon={Layers} color="border-brand-maeve/40 text-brand-maeve" label="Total keys" value={keys.length} />
          <StatCard icon={Repeat} color="border-brand-orange/40 text-brand-orange" label="Top-ups" value={topUps} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <SectionLink
            href="/account/keys"
            icon={Key}
            color="border-brand-navy/40 text-brand-navy"
            title="API Keys"
            subtitle={activeKeys.length > 0 ? `${activeKeys.length} active` : "Create your first key"}
          />
          <SectionLink
            href="/account/credits"
            icon={Coins}
            color="border-brand-rose/40 text-brand-rose"
            title="Credits"
            subtitle={`${balance.toLocaleString()} remaining`}
          />
          <SectionLink
            href="/account/usage"
            icon={BarChart2}
            color="border-brand-purple/40 text-brand-purple"
            title="Usage"
            subtitle="No monthly cap, metered by credits"
          />
        </div>
      </div>

      <BuyCreditsDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        address={address}
        treasuryAddress={treasuryAddress}
        onCredited={() => mutateCredits()}
      />
    </div>
  );
}
