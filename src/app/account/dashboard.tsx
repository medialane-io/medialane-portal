"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ApiKeysTab } from "@/src/components/portal/api-keys-tab";
import { UsageTab } from "@/src/components/portal/usage-tab";
import { WebhooksTab } from "@/src/components/portal/webhooks-tab";
import { CreditsTab } from "@/src/components/portal/credits-tab";
import { Key, BarChart2, Webhook, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

const MDLN_TIER_LABELS = ["", "500+ MDLN", "2K+ MDLN", "5K+ MDLN"];
const MDLN_TIER_MULTIPLIERS = ["", "1.2×", "1.5×", "2.0×"];

interface Props {
  address: string;
  mdln_tier: number;
}

export function AccountDashboard({ address, mdln_tier }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl pt-28 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg font-mono font-bold truncate text-white">
                  {address.slice(0, 8)}&hellip;{address.slice(-6)}
                </h1>
                {mdln_tier > 0 && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {MDLN_TIER_LABELS[mdln_tier]} &middot; {MDLN_TIER_MULTIPLIERS[mdln_tier]} credits
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Starknet Wallet</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">API Portal</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Manage keys, usage &amp; credits</p>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="w-full h-auto p-1 gap-1 bg-black/40 border border-white/10 rounded-xl grid grid-cols-4">
            <TabsTrigger
              value="keys"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Usage</span>
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Webhook className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys"><ApiKeysTab /></TabsContent>
          <TabsContent value="credits"><CreditsTab address={address} mdln_tier={mdln_tier} /></TabsContent>
          <TabsContent value="usage"><UsageTab /></TabsContent>
          <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
