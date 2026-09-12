"use client";

import { useState } from "react";
import { KeyRound, Copy, Check, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadSealedOwner } from "@/lib/wallet/store";
import { isRecoveryKeyForWallet } from "@/lib/wallet/recovery-key";
import { unlockOwnerKey } from "@/lib/wallet/passkey";
import { friendlyErrorMessage } from "@/lib/friendly-error";

export function ExportKeySection() {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      const sealed = loadSealedOwner();
      if (!sealed) {
        setError("This browser has no wallet key stored.");
        return;
      }
      if (!isRecoveryKeyForWallet(sealed)) {
        setError(
          "This device was approved from another one, so its key cannot restore your account on its own. Export from the device you first signed up on.",
        );
        return;
      }
      setPrivateKey(await unlockOwnerKey(sealed));
    } catch (err) {
      setError(friendlyErrorMessage(err, "Could not unlock your key. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!privateKey) return;
    await navigator.clipboard.writeText(privateKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hide = () => {
    setPrivateKey(null);
    setCopied(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold">Recovery key</p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Save this somewhere private, such as a password manager. It restores your account if you
          lose access to every device you use. To start using a new phone or browser, approve it
          from a device you already have.
        </p>
      </div>

      {privateKey ? (
        <>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="text-xs leading-relaxed">
              <span className="font-semibold">Anyone with this key controls your wallet.</span>{" "}
              Medialane will never ask you for it. Treat any message requesting it as an attempt to
              take your assets.
            </AlertDescription>
          </Alert>
          <code className="block break-all rounded-xl bg-muted px-3 py-2.5 font-mono text-xs select-all">
            {privateKey}
          </code>
          <div className="flex items-center gap-2">
            <Button onClick={copy} variant="outline" size="sm">
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy key"}
            </Button>
            <Button onClick={hide} variant="ghost" size="sm">
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Hide
            </Button>
          </div>
        </>
      ) : (
        <>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={reveal} disabled={busy} variant="outline" size="sm" className="self-start">
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <KeyRound className="mr-1.5 h-3.5 w-3.5" />}
            Show recovery key
          </Button>
        </>
      )}
    </div>
  );
}
