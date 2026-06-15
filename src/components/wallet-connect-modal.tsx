"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useConnect } from "@starknet-react/core";
import type { Connector } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";

// ── Connector display helpers (mirrors the dapp's ConnectWallet.tsx) ─────────

type ConnectorIconObj = { dark?: string; light?: string };

function getConnectorIconSrc(
  icon: ConnectorIconObj | string | undefined
): string | undefined {
  if (!icon) return undefined;
  if (typeof icon === "string") return icon;
  return icon.dark ?? icon.light;
}

function getConnectorDisplayName(id: string, fallback: string): string {
  const NAMES: Record<string, string> = {
    argentX: "Ready",
    braavos: "Braavos",
    webwallet: "Argent Web Wallet",
  };
  return NAMES[id] ?? fallback;
}

// Portal wallet kinds are intentionally Ready / Braavos only.
const ALLOWED_CONNECTORS = ["argentX", "braavos"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectModal({ open, onOpenChange }: Props) {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Connect-only: as soon as a wallet is connected, close the picker. Signing
  // happens later, lazily, when the user enters an authenticated area.
  useEffect(() => {
    if (open && status === "connected" && address) {
      onOpenChange(false);
      setConnectingId(null);
    }
  }, [open, status, address, onOpenChange]);

  const pickable = connectors.filter((c) => ALLOWED_CONNECTORS.includes(c.id));

  const handleConnectorClick = (connector: Connector) => {
    setConnectingId(connector.id);
    try {
      connect({ connector });
    } catch {
      setConnectingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose how you want to connect to Medialane.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 pt-1">
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Browser Wallets
            </p>
            <div className="grid gap-2">
              {pickable.length > 0 ? (
                pickable.map((connector) => {
                  const iconSrc = getConnectorIconSrc(
                    connector.icon as ConnectorIconObj | string | undefined
                  );
                  const displayName = getConnectorDisplayName(
                    connector.id,
                    connector.name
                  );
                  return (
                    <Button
                      key={connector.id}
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => handleConnectorClick(connector)}
                      disabled={connectingId !== null}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded shrink-0"
                          unoptimized
                        />
                      ) : (
                        <Wallet className="h-4 w-4 shrink-0" />
                      )}
                      <span>{displayName}</span>
                      {connectingId === connector.id && (
                        <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                      )}
                    </Button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No browser wallets detected. Install Ready or Braavos to continue.
                </p>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
