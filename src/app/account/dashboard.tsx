"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowRight, ExternalLink, Key, Plus, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/src/hooks/use-wallet";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { BuyCreditsDialog } from "@/src/components/portal/buy-credits-dialog";
import { SpendPanel } from "@/src/components/portal/spend-panel";
import { EXPLORER_URL } from "@/src/lib/constants";
import { getTokenByAddress } from "@medialane/sdk";

interface Props {
  address: string;
}

interface ApiKey {
  id: string;
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
}

interface PaymentRow {
  creditedAmount: number;
  asset?: string;
  txHash: string;
  createdAt: string;
}

interface CreditsData {
  data?: { balance?: number; history?: PaymentRow[] };
}

function when(iso: string | null): string {
  if (!iso) return "never used";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "used today";
  if (days === 1) return "used yesterday";
  return `used ${days} days ago`;
}

export function AccountDashboard({ address }: Props) {
  const router = useRouter();
  const { disconnect } = useWallet();
  const { signOut } = usePortalAuth();
  const [depositOpen, setDepositOpen] = useState(false);

  const { data: keysData, isLoading: keysLoading } = useSWR<{ data: ApiKey[] }>(
    `/api/portal/keys?address=${address}`,
    portalFetcher,
  );
  const { data: creditsData, isLoading: creditsLoading, mutate: mutateCredits } = useSWR<CreditsData>(
    `/api/portal/credits?address=${address}`,
    portalFetcher,
  );

  async function handleSignOut() {
    await signOut();
    disconnect();
    router.push("/");
  }

  const keys = keysData?.data ?? [];
  const activeKeys = keys.filter((k) => k.status === "ACTIVE");
  const balance = creditsData?.data?.balance ?? 0;
  const payments = creditsData?.data?.history ?? [];
  const treasuryAddress = process.env.NEXT_PUBLIC_STARKNET_X402_TREASURY ?? "";

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Your account</h1>
            <p className="mt-1 text-muted-foreground">
              {address.slice(0, 8)}…{address.slice(-6)} · Starknet
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        <section className="rounded-2xl bg-brand-rose p-8 text-white">
          <p className="text-white/70">Credits</p>
          {creditsLoading ? (
            <Skeleton className="mt-2 h-14 w-40 bg-white/20" />
          ) : (
            <p className="text-6xl font-bold tabular-nums">{balance.toLocaleString()}</p>
          )}

          <p className="mt-2 text-white/70">Shared across every API key</p>

          <Button
            className="mt-6 bg-white text-brand-rose hover:bg-white/90"
            onClick={() => setDepositOpen(true)}
            disabled={!treasuryAddress}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add credits
          </Button>
        </section>

        <Link
          href="/launchpad"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-brand-blue p-6 text-white transition-opacity hover:opacity-95"
        >
          <div className="flex items-center gap-4">
            <Rocket className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-xl font-bold">Launchpad</p>
              <p className="text-white/80">Issue to a list of people, or tokenize what you own.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">API keys</h2>
            <Link href="/account/keys" className="text-primary hover:underline">
              Manage
            </Link>
          </div>

          {keysLoading ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : activeKeys.length === 0 ? (
            <div className="rounded-xl bg-muted/50 p-6 text-center">
              <p className="text-muted-foreground">No keys yet.</p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/account/keys">Create a key</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {activeKeys.map((k) => (
                <li key={k.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background">
                    <Key className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{k.label ?? "Untitled key"}</p>
                    <p className="truncate text-muted-foreground">
                      <code>{k.prefix}•••</code> · {when(k.lastUsedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Where your credits went</h2>
          <SpendPanel />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Top-ups</h2>

          {payments.length === 0 ? (
            <p className="text-muted-foreground">Nothing yet. Credits you add will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {payments.map((p) => (
                <li key={p.txHash} className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">+{p.creditedAmount.toLocaleString()} credits</p>
                    <p className="text-muted-foreground">
                      {(p.asset ? getTokenByAddress(p.asset)?.symbol : null) ?? "token"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`${EXPLORER_URL}/tx/${p.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <BuyCreditsDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        address={address}
        treasuryAddress={treasuryAddress}
        balance={balance}
        onCredited={() => mutateCredits()}
      />
    </div>
  );
}
