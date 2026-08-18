"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Key, BarChart2, Coins, ArrowRight, Plus } from "lucide-react";
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

function StatLink({
  href,
  icon: Icon,
  bg,
  fg,
  value,
  label,
  subtitle,
}: {
  href: string;
  icon: typeof Key;
  bg: string;
  fg: string;
  value: string | number;
  label: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-6 rounded-2xl p-6 ${bg} transition-transform hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${fg}`} />
        <ArrowRight className={`w-4 h-4 ${fg} opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-sm font-semibold text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
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
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Account</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Your Medialane account</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Manage the keys, credits, and usage behind everything you build and run on Medialane.
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

      <div className="container mx-auto px-4 max-w-5xl pb-16 space-y-4">
        <div className="rounded-2xl bg-brand-purple/10 p-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Credits balance</p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">credits remaining</p>
          <Button
            variant="gradient-fill"
            onClick={() => setDepositOpen(true)}
            disabled={!treasuryAddress}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add credits
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatLink
            href="/account/keys"
            icon={Key}
            bg="bg-brand-blue/10"
            fg="text-brand-blue"
            value={activeKeys.length}
            label="API Keys"
            subtitle={activeKeys.length > 0 ? `${activeKeys.length} active of ${keys.length}` : "Create your first key"}
          />
          <StatLink
            href="/account/credits"
            icon={Coins}
            bg="bg-brand-rose/10"
            fg="text-brand-rose"
            value={balance.toLocaleString()}
            label="Credits"
            subtitle="Shared across every key"
          />
          <StatLink
            href="/account/usage"
            icon={BarChart2}
            bg="bg-brand-orange/10"
            fg="text-brand-orange"
            value={topUps}
            label="Top-ups"
            subtitle="See usage metered per call, per key"
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
