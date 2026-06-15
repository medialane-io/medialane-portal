"use client";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Wallet, CheckCircle2, ChevronRight } from "lucide-react";

const WALLET_META: Record<string, { label: string; icon: string }> = {
  argentX: { label: "Ready (Argent)", icon: "🔷" },
  braavos: { label: "Braavos", icon: "🔵" },
};

// Portal wallet kinds are intentionally Ready / Braavos only.
const ALLOWED_CONNECTORS = ["argentX", "braavos"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectModal({ open, onOpenChange }: Props) {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Connect-only: as soon as a wallet is connected, close the picker. Signing
  // happens later, lazily, when the user enters an authenticated area.
  useEffect(() => {
    if (open && status === "connected" && address) {
      onOpenChange(false);
    }
  }, [open, status, address, onOpenChange]);

  const pickable = connectors.filter((c) => ALLOWED_CONNECTORS.includes(c.id));

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

        {status === "connected" && address ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Connected</p>
                <p className="text-sm font-mono text-white truncate">
                  {address.slice(0, 10)}...{address.slice(-6)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-white"
              onClick={() => disconnect()}
            >
              Use a different wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {pickable.map((connector) => {
              const meta = WALLET_META[connector.id] ?? {
                label: connector.name,
                icon: "🔌",
              };
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
                Get a Starknet wallet
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
