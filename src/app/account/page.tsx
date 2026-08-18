"use client";

import { Wallet, ShieldCheck, AlertCircle } from "lucide-react";
import { useWallet } from "@/src/hooks/use-wallet";
import { usePortalAuth } from "@/src/hooks/use-portal-auth";
import { Button } from "@/src/components/ui/button";
import { useConnectDialog } from "@/src/components/connect-dialog";
import { AccountDashboard } from "./dashboard";

export default function AccountPage() {
  const { address, isConnected, isConnecting } = useWallet();
  const { session, isLoading, signingIn, error, signIn } = usePortalAuth();
  const { open: openConnectDialog } = useConnectDialog();

  if (session) {
    return <AccountDashboard address={session.address} />;
  }

  if (isConnected && address && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center pt-28">
          <ShieldCheck className="w-10 h-10 text-primary" />
          <h1 className="text-xl font-semibold text-white">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Sign a message to prove this wallet is yours. We never store your keys — the
            signature just unlocks your API keys, credits and usage.
          </p>
          <Button
            onClick={signIn}
            disabled={signingIn}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            {signingIn ? "Check your wallet…" : "Sign in"}
          </Button>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center pt-28">
        <Wallet className="w-10 h-10 text-primary" />
        <h1 className="text-xl font-semibold text-white">Connect your wallet</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Connect a Starknet wallet to manage your API keys, credits and usage.
        </p>
        <Button onClick={openConnectDialog} disabled={isConnecting} className="rounded-full bg-primary hover:bg-primary/90 text-white">
          {isConnecting ? "Connecting…" : "Connect wallet"}
        </Button>
      </div>
    </div>
  );
}
