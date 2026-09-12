"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { setFirstGuardian } from "@/lib/wallet/guardian";
import { isValidStarknetAddress } from "@/lib/wallet/account-ops";
import type { SealedOwner } from "@/lib/wallet/passkey";
import { friendlyErrorMessage } from "@/lib/friendly-error";

interface AddGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sealed: SealedOwner;
  onAdded: () => void;
}

export function AddGuardianDialog({ open, onOpenChange, sealed, onAdded }: AddGuardianDialogProps) {
  const [pubkey, setPubkey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = pubkey.trim();
    if (!isValidStarknetAddress(trimmed)) {
      setError("Enter a valid Stark-curve public key.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setFirstGuardian(sealed, trimmed);
      onOpenChange(false);
      setPubkey("");
      onAdded();
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Add a guardian
          </DialogTitle>
          <DialogDescription>
            A guardian can help you recover this wallet if you lose this device, but can
            never move your funds. Paste the public key of a wallet you control — another
            device&apos;s Media Wallet, for example. You can only set this up once from here;
            changing it later isn&apos;t supported in this app yet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={pubkey}
            onChange={(e) => setPubkey(e.target.value)}
            placeholder="0x…"
            disabled={busy}
            className="font-mono text-xs"
            onKeyDown={(e) => e.key === "Enter" && pubkey.trim() && void handleAdd()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleAdd} disabled={busy || !pubkey.trim()} className="w-full">
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? "Confirm with passkey…" : "Add guardian"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
