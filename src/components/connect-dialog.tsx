"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Connector } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Wallet, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/src/hooks/use-wallet";
import { getFriendlyWalletError } from "@/src/lib/wallet-error";
import { WALLET_INSTALL_URLS, getConnectorIconSrc } from "@/src/lib/wallet-connectors";

const CONNECT_OPEN = "ml:connect-open";
const CONNECT_CLOSE = "ml:connect-close";

export function useConnectDialog() {
  return {
    open: () => document.dispatchEvent(new CustomEvent(CONNECT_OPEN)),
    close: () => document.dispatchEvent(new CustomEvent(CONNECT_CLOSE)),
  };
}

export function ConnectDialog() {
  const { connectors, isConnected, isConnecting: sessionConnecting, connect } = useWallet();
  const [open, setOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    document.addEventListener(CONNECT_OPEN, onOpen);
    document.addEventListener(CONNECT_CLOSE, onClose);
    return () => {
      document.removeEventListener(CONNECT_OPEN, onOpen);
      document.removeEventListener(CONNECT_CLOSE, onClose);
    };
  }, []);

  useEffect(() => {
    if (isConnected) setOpen(false);
  }, [isConnected]);

  const handleConnectorClick = async (connector: Connector) => {
    setConnectingId(connector.id);
    try {
      await connect({ connector });
    } catch (err) {
      console.error("Failed to connect wallet", err);
      const friendly = getFriendlyWalletError(err);
      if (friendly.isUserRejection) {
        toast.info("Wallet didn't connect", { description: "You may have declined it, or your wallet may need extra verification first." });
      } else {
        toast.error("Wallet connection failed", { description: friendly.message, duration: 8000 });
      }
      setOpen(true);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose how you want to connect to Medialane.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 pt-1">
          <section>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Browser Wallets
            </p>
            <div className="grid gap-2">
              {connectors.length > 0 ? (
                connectors.map((connector) => {
                  const iconSrc = getConnectorIconSrc(connector.icon);
                  const displayName = connector.name;
                  const installed = connector.available();
                  const installUrl = WALLET_INSTALL_URLS[connector.id];
                  if (!installed && installUrl) {
                    return (
                      <a
                        key={connector.id}
                        href={installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                      >
                        {iconSrc ? (
                          <Image src={iconSrc} alt="" width={20} height={20} className="h-5 w-5 rounded shrink-0 opacity-60" unoptimized />
                        ) : (
                          <Wallet className="h-4 w-4 shrink-0" />
                        )}
                        <span>Install {displayName}</span>
                        <ExternalLink className="ml-auto h-3 w-3" />
                      </a>
                    );
                  }
                  return (
                    <Button
                      key={connector.id}
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => handleConnectorClick(connector)}
                      disabled={sessionConnecting || connectingId !== null}
                    >
                      {iconSrc ? (
                        <Image src={iconSrc} alt="" width={20} height={20} className="h-5 w-5 rounded shrink-0" unoptimized />
                      ) : (
                        <Wallet className="h-4 w-4 shrink-0" />
                      )}
                      <span>{displayName}</span>
                      {connectingId === connector.id && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
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
