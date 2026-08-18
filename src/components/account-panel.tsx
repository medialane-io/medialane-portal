"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle, ChevronRight, Copy, ExternalLink,
  LayoutDashboard, LogOut, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";
import { Button } from "@/src/components/ui/button";
import { useWallet } from "@/src/hooks/use-wallet";
import { getConnectorIconSrc } from "@/src/lib/wallet-connectors";
import { isWrongNetwork as computeIsWrongNetwork } from "@/src/lib/wallet-error";
import { EXPLORER_URL } from "@/src/lib/constants";
import { useNavAccountSheet, NavThemeToggle } from "@medialane/ui";

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function ChipIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground">
      {children}
    </span>
  );
}

export function AccountPanel() {
  const { chainId, connector } = useAccount();
  const { address, disconnect } = useWallet();
  const { close } = useNavAccountSheet();

  const walletName = connector?.name ?? "Browser Wallet";
  const walletIconSrc = getConnectorIconSrc(connector?.icon);

  if (!address) return null;

  const isWrongNetwork = computeIsWrongNetwork(chainId, mainnet.id.toString());

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const handleDisconnect = () => {
    disconnect();
    close();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted">
          {walletIconSrc ? (
            <Image src={walletIconSrc} alt="" fill className="object-cover" unoptimized />
          ) : (
            <Wallet className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{truncate(address)}</h3>
            <button onClick={copyAddress} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Copy address">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {walletName} · Starknet
          </p>
        </div>
        <Link
          href={`${EXPLORER_URL}/contract/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all hover:text-foreground"
          aria-label="View on explorer"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-1">
        <div className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40">
          <Link href="/account" onClick={close} className="flex min-w-0 flex-1 items-center gap-3">
            <ChipIcon>
              <LayoutDashboard className="h-4 w-4" />
            </ChipIcon>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">Account</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </Link>
          <NavThemeToggle />
        </div>
      </div>

      {isWrongNetwork && (
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-destructive">Switch network needed</p>
            <p className="text-[10px] leading-relaxed text-destructive/70">
              Switch to Starknet Mainnet in your wallet to interact with Medialane.
            </p>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="group h-11 w-full border-border/40 transition-all hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Disconnect
      </Button>
    </div>
  );
}
