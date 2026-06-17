"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useConnect } from "@starknet-react/core";
import { Wallet } from "lucide-react";

/**
 * Connect-only wallet picker (Ready / Braavos). No signing happens here — it
 * connects an injected wallet and closes. The connected address becomes the
 * portal's identity.
 */
export function WalletConnectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { connect, connectors } = useConnect();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
          <DialogDescription>
            Connect a Starknet wallet to manage your API keys, credits and usage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="secondary"
              className="w-full justify-start gap-3 rounded-lg"
              onClick={() => {
                connect({ connector });
                onOpenChange(false);
              }}
            >
              <Wallet className="w-4 h-4" />
              {connector.name}
            </Button>
          ))}
          {connectors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No Starknet wallet detected. Install Ready or Braavos to continue.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
