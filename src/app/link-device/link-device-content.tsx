"use client";

import { describeError } from "@medialane/ui";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOwnerKey, PasskeyCancelledError, type SealedOwner } from "@/lib/wallet/passkey";
import { saveSealedOwner, notifyWalletChange } from "@/lib/wallet/store";
import { useSession } from "@/hooks/use-session";
import { isOwnerOf } from "@/lib/wallet/devices";
import { safeRelativePath } from "@/lib/safe-redirect";
import { encodePairingPayload, parseAccountAddress } from "@medialane/sdk/starknet";

type Step = "start" | "creating" | "share" | "checking";

export function LinkDeviceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRelativePath(searchParams.get("redirect_url")) ?? "/account";
  const [step, setStep] = useState<Step>("start");
  const [pending, setPending] = useState<SealedOwner | null>(null);
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useSession();
  useEffect(() => {
    setAddress((current) => current || session?.walletAddress || "");
  }, [session?.walletAddress]);

  const start = async () => {
    setError(null);
    setStep("creating");
    try {
      const created = await createOwnerKey();
      setPending(created.sealed);
      setCode(
        encodePairingPayload({
          publicKey: created.sealed.ownerPubKey,
          label: typeof navigator === "undefined" ? "" : navigator.platform,
        }),
      );
      setStep("share");
    } catch (e) {
      setError(
        e instanceof PasskeyCancelledError
          ? "Confirmation cancelled."
          : describeError(e, "Could not set up this device.").message,
      );
      setStep("start");
    }
  };

  const finish = async () => {
    if (!pending) return;
    setError(null);
    setStep("checking");
    try {
      const account = parseAccountAddress(address);
      const approved = await isOwnerOf(account, pending.ownerPubKey);
      if (!approved) {
        setError("This device has not been approved yet. Approve it on your other device, then try again.");
        setStep("share");
        return;
      }
      saveSealedOwner({ ...pending, address: account });
      notifyWalletChange();
      router.replace(redirectTo);
    } catch (e) {
      setError(describeError(e, "Could not confirm this device.").message);
      setStep("share");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Use this account here</CardTitle>
          <CardDescription>
            Your wallet stays on the devices that hold its key. Approve this one from a device where you
            are already signed in, and it will sign for itself from then on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "share" || step === "checking" ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">1. Paste this code on your other device</p>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="break-all font-mono text-xs text-muted-foreground">{code}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={copy}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy code"}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  On your other device, open Settings, then Devices, and paste it there.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">2. Then confirm your account address</p>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x…"
                  className="font-mono text-xs"
                  disabled={step === "checking"}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" onClick={finish} disabled={!address.trim() || step === "checking"}>
                {step === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish"}
              </Button>
            </>
          ) : (
            <>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" onClick={start} disabled={step === "creating"}>
                {step === "creating" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add this device"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
