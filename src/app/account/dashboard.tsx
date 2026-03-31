"use client";

import { authClient } from "@/src/lib/auth-client";
import { useGetWallet } from "@chipi-stack/nextjs";
import { WalletSummary } from "@/src/components/chipi/wallet-summary";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ApiKeysTab } from "@/src/components/portal/api-keys-tab";
import { UsageTab } from "@/src/components/portal/usage-tab";
import { PlanTab } from "@/src/components/portal/plan-tab";
import { WebhooksTab } from "@/src/components/portal/webhooks-tab";
import { WalletIcon, Key, BarChart2, Zap, Webhook } from "lucide-react";
import { useRouter } from "next/navigation";

type WalletShape = { wallet: { publicKey: string; normalizedPublicKey: string } };

interface Props {
  initialPlan: string;
  userImageUrl: string;
  userFullName: string | null;
  userEmail: string;
  userId: string;
  publicKey?: string;
}

export function AccountDashboard({
  initialPlan,
  userImageUrl,
  userFullName,
  userEmail,
  userId,
  publicKey,
}: Props) {
  const router = useRouter();

  const { data: wallet } = useGetWallet({
    getBearerToken: () => authClient.token().then((t) => t?.token ?? ""),
    params: { externalUserId: userId },
    queryOptions: { enabled: !!userId && !publicKey },
  });

  const displayWallet: WalletShape | null = publicKey
    ? { wallet: { publicKey, normalizedPublicKey: publicKey } }
    : (wallet as WalletShape | null) ?? null;

  const isPremium = initialPlan === "PREMIUM";

  return (
    <div className="min-h-screen">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl pt-28 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              {/* Name + email */}
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold truncate">
                  {userFullName ?? userEmail.split("@")[0]}
                </h1>
                <Badge
                  variant="secondary"
                  className={
                    isPremium
                      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-xs"
                      : "bg-white/5 text-muted-foreground border-white/10 text-xs"
                  }
                >
                  {initialPlan}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>

            {/* Page label */}
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">API Portal</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Manage keys, usage &amp; plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="w-full h-auto p-1 gap-1 bg-black/40 border border-white/10 rounded-xl grid grid-cols-5">
            <TabsTrigger
              value="wallet"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <WalletIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger
              value="keys"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Usage</span>
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Webhook className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            {displayWallet ? (
              <div className="space-y-3">
                <WalletSummary
                  normalizedPublicKey={displayWallet.wallet.normalizedPublicKey}
                  walletPublicKey={displayWallet.wallet.publicKey}
                />
                <p className="text-xs text-muted-foreground/60 text-center">
                  Smart contract wallet on Starknet — secured by your passkey or PIN.
                </p>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-primary/20 bg-black/20">
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-12">
                  <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                    <WalletIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">No wallet found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Complete onboarding to create your Starknet smart contract wallet.
                    </p>
                  </div>
                  <Button onClick={() => router.push("/onboarding")} size="sm">
                    Set up wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys">
            <ApiKeysTab />
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <UsageTab plan={initialPlan} />
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan">
            <PlanTab plan={initialPlan} />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <WebhooksTab plan={initialPlan} />
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
