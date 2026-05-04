"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Wallet, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const WALLET_META: Record<string, { label: string; icon: string }> = {
  argentX:   { label: "Argent X",             icon: "🔷" },
  braavos:   { label: "Braavos",              icon: "🔵" },
  controller: { label: "Cartridge Controller", icon: "🕹️" },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}

export function WalletConnectModal({ open, onOpenChange, redirectTo = "/account" }: Props) {
  const { address, account, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!address || !account) return;
    setSigning(true);
    setError(null);

    try {
      const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
      const { nonce, typedData } = await challengeRes.json();

      const signature = await account.signMessage(typedData);
      const sigArray = Array.isArray(signature)
        ? signature.map((s) => s.toString())
        : [(signature as { r: bigint; s: bigint }).r.toString(), (signature as { r: bigint; s: bigint }).s.toString()];

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, nonce, signature: sigArray }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "Verification failed");
      }

      await fetch("/api/portal/provision", { method: "POST" });

      onOpenChange(false);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-1">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Your Starknet wallet is your account. No email or password needed.
          </DialogDescription>
        </DialogHeader>

        {status === "disconnected" ? (
          <div className="space-y-2 pt-2">
            {connectors.map((connector) => {
              const meta = WALLET_META[connector.id] ?? { label: connector.name, icon: "🔌" };
              return (
                <Button
                  key={connector.id}
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10 justify-between text-white h-12"
                  onClick={() => connect({ connector })}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="font-medium">{meta.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              );
            })}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have a wallet?{" "}
              <a
                href="https://www.argent.xyz/argent-x/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get Argent X
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Connected</p>
                <p className="text-sm font-mono text-white truncate">
                  {address?.slice(0, 10)}...{address?.slice(-6)}
                </p>
              </div>
            </div>

            <Button className="w-full" onClick={handleSignIn} disabled={signing}>
              {signing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing message…</>
              ) : (
                <><Wallet className="w-4 h-4 mr-2" />Sign in to Medialane</>
              )}
            </Button>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-white"
              onClick={() => disconnect()}
            >
              Use a different wallet
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
