"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ApiKeysTab } from "@/src/components/portal/api-keys-tab";
import { UsageTab } from "@/src/components/portal/usage-tab";
import { CreditsTab } from "@/src/components/portal/credits-tab";
import { Key, BarChart2, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/src/hooks/use-wallet";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { Button } from "@/src/components/ui/button";

interface Props {
  address: string;
}

export function AccountDashboard({ address }: Props) {
  const [tab, setTab] = useState("keys");
  const router = useRouter();
  const { disconnect } = useWallet();
  const { signOut } = usePortalAuth();

  async function handleSignOut() {
    await signOut();
    disconnect();
    router.push("/");
  }

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
        <Tabs value={tab} onValueChange={setTab} className="space-y-8">
          <TabsList className="h-auto p-0 bg-transparent gap-6 justify-start w-full">
            <TabsTrigger
              value="keys"
              className="flex items-center gap-1.5 px-0 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-brand-purple data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Key className="w-4 h-4 shrink-0" />
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="flex items-center gap-1.5 px-0 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-brand-purple data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Coins className="w-4 h-4 shrink-0" />
              Credits
            </TabsTrigger>
            <TabsTrigger
              value="usage"
              className="flex items-center gap-1.5 px-0 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-brand-purple data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys"><ApiKeysTab address={address} /></TabsContent>
          <TabsContent value="credits"><CreditsTab address={address} /></TabsContent>
          <TabsContent value="usage"><UsageTab address={address} onViewCredits={() => setTab("credits")} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
