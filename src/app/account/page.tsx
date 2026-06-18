"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useWallet } from "@/src/hooks/use-wallet";
import { Button } from "@/src/components/ui/button";
import { AccountDashboard } from "./dashboard";

export default function AccountPage() {
  const { address, isConnected, isConnecting } = useWallet();

  if (isConnected && address) {
    // mdln_tier was previously baked into the auth session (server-computed at
    // sign-in). With auth removed it defaults to 0 here; a client-side MDLN
    // balance read can re-enable the tier display later.
    return <AccountDashboard address={address} mdln_tier={0} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center pt-28">
        <Wallet className="w-10 h-10 text-primary" />
        <h1 className="text-xl font-semibold text-white">Connect your wallet</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Connect a Starknet wallet to manage your API keys, credits and usage.
        </p>
        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white">
          <Link href="/?connect=1">{isConnecting ? "Connecting…" : "Connect wallet"}</Link>
        </Button>
      </div>
    </div>
  );
}
