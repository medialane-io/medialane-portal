"use client";

import useSWR from "swr";
import { PortfolioOverview, StatTile, type PortfolioBentoTileConfig } from "@medialane/ui";
import { Key, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/src/hooks/use-wallet";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { Button } from "@/src/components/ui/button";
import { portalFetcher } from "@/src/lib/portal/fetcher";

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
  data?: { balance?: number };
}

export function AccountDashboard({ address }: Props) {
  const router = useRouter();
  const { disconnect } = useWallet();
  const { signOut } = usePortalAuth();

  const { data: keysData } = useSWR<{ data: ApiKey[] }>(`/api/portal/keys?address=${address}`, portalFetcher);
  const { data: creditsData } = useSWR<CreditsData>(`/api/portal/credits?address=${address}`, portalFetcher);

  async function handleSignOut() {
    await signOut();
    disconnect();
    router.push("/");
  }

  const keys = keysData?.data ?? [];
  const activeKeys = keys.filter((k) => k.status === "ACTIVE");
  const balance = creditsData?.data?.balance ?? 0;

  const tiles: PortfolioBentoTileConfig[] = [
    {
      key: "keys",
      title: "API Keys",
      href: "/account/keys",
      content: (
        <div className="space-y-3">
          <StatTile label="Active keys" value={activeKeys.length} big />
          {activeKeys.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active keys yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {activeKeys.slice(0, 3).map((k) => (
                <li key={k.id} className="flex items-center gap-2 text-xs">
                  <Key className="w-3 h-3 text-muted-foreground shrink-0" />
                  <code className="font-mono text-primary">{k.prefix}***</code>
                  {k.label && <span className="text-muted-foreground truncate">({k.label})</span>}
                </li>
              ))}
              {activeKeys.length > 3 && (
                <li className="text-xs text-muted-foreground">+{activeKeys.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      ),
    },
    {
      key: "credits",
      title: "Credits",
      href: "/account/credits",
      content: (
        <div className="space-y-3">
          <StatTile label="Balance" value={balance.toLocaleString()} sub="credits remaining" big accent="var(--primary)" />
          <Button size="sm" variant="gradient-fill" className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add credits
          </Button>
        </div>
      ),
    },
    {
      key: "usage",
      title: "Usage",
      href: "/account/usage",
      size: "wide",
      content: (
        <p className="text-sm text-muted-foreground">
          There&apos;s no monthly request cap — every call is metered by credits instead, drawn from the same
          balance no matter which key made it.
        </p>
      ),
    },
  ];

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

      <div className="container mx-auto px-4 max-w-5xl pb-8">
        <PortfolioOverview tiles={tiles} />
      </div>
    </div>
  );
}
