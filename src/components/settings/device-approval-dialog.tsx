"use client";

import { useState } from "react";
import { Loader2, Smartphone, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parsePairingPayload, type PairingPayload } from "@/lib/wallet/pairing";
import { addDevice } from "@/lib/wallet/devices";
import { loadSealedOwner } from "@/lib/wallet/store";
import { friendlyErrorMessage } from "@/lib/friendly-error";

export function DeviceApprovalDialog({
  open,
  onOpenChange,
  onApproved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [pending, setPending] = useState<PairingPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRaw("");
    setPending(null);
    setError(null);
  };

  const review = () => {
    setError(null);
    try {
      setPending(parsePairingPayload(raw.trim()));
    } catch (e) {
      setError(friendlyErrorMessage(e));
    }
  };

  const approve = async () => {
    const sealed = loadSealedOwner();
    if (!sealed || !pending) return;
    setBusy(true);
    setError(null);
    try {
      await addDevice(sealed, pending.publicKey);
      reset();
      onOpenChange(false);
      onApproved();
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a device</DialogTitle>
          <DialogDescription>
            On the new device, sign in and choose &ldquo;Add this device&rdquo;. Paste the code it
            shows you here.
          </DialogDescription>
        </DialogHeader>

        {pending ? (
          <div className="space-y-4">
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>
                This gives the device full control of your account and everything in it. Only
                continue if you are holding it yourself.
              </AlertDescription>
            </Alert>

            <div className="rounded-xl bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pending.label || "Unnamed device"}</span>
              </div>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {pending.publicKey}
              </p>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset} disabled={busy}>
                Back
              </Button>
              <Button className="flex-1" onClick={approve} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve device"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Paste the code from your other device"
              rows={4}
              className="font-mono text-xs"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" onClick={review} disabled={!raw.trim()}>
              Review device
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
