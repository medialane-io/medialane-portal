"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { buildApprovalUrl } from "@medialane/sdk/starknet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOwnerKey, PasskeyCancelledError, type SealedOwner } from "@/lib/wallet/passkey";
import { saveSealedOwner, notifyWalletChange } from "@/lib/wallet/store";
import { isOwnerOf } from "@/lib/wallet/devices";
import { loadAccountAddress } from "@/lib/wallet/account-wallet";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const APPROVER_ORIGIN = "https://www.medialane.io";
const APP_NAME = "Medialane Portal";
const PENDING_KEY = "medialane.portal.pending-owner.v1";

type Step = "start" | "creating" | "confirming";

export default function LinkDevicePage() {
  return (
    <Suspense fallback={null}>
      <LinkDeviceForm />
    </Suspense>
  );
}

function setupFailure(e: unknown): string {
  if (e instanceof PasskeyCancelledError) return "No problem — you can start again whenever you like.";

  const raw = e instanceof Error ? e.message : String(e);
  if (/prf/i.test(raw)) {
    return "This browser cannot set up a passkey. Try Safari, or Chrome on an up-to-date system.";
  }
  if (/relying party|registrable domain|SecurityError/i.test(raw)) {
    return "We could not set this up just now. It is our side, not yours — try again shortly.";
  }
  return friendlyErrorMessage(e, "That did not work. Try again in a moment.");
}

function loadPending(): SealedOwner | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as SealedOwner) : null;
  } catch {
    return null;
  }
}

function LinkDeviceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_url");
  const approval = searchParams.get("approval");
  const [step, setStep] = useState<Step>("start");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (approval !== "approved") {
      if (approval === "declined") setError("Not approved. You can try again whenever you like.");
      return;
    }

    const pending = loadPending();
    const account = loadAccountAddress();
    if (!pending || !account) {
      setError("That approval could not be matched. Start again.");
      return;
    }

    setStep("confirming");
    isOwnerOf(account, pending.ownerPubKey)
      .then((owns) => {
        if (!owns) {
          setError("Not approved yet. Try again in a moment.");
          setStep("start");
          return;
        }
        saveSealedOwner({ ...pending, address: account });
        notifyWalletChange();
        sessionStorage.removeItem(PENDING_KEY);
        router.replace(redirectTo ?? "/");
      })
      .catch((e) => {
        setError(friendlyErrorMessage(e, "Could not confirm the approval."));
        setStep("start");
      });
  }, [approval, redirectTo, router]);

  const start = async () => {
    setError(null);
    setStep("creating");
    try {
      const created = await createOwnerKey();
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(created.sealed));

      const back = new URL(window.location.href);
      back.searchParams.delete("approval");

      window.location.href = buildApprovalUrl(APPROVER_ORIGIN, {
        publicKey: created.sealed.ownerPubKey,
        appName: APP_NAME,
        returnUrl: back.toString(),
      });
    } catch (e) {
      console.error("[link-device] setup failed", e);
      setError(setupFailure(e));
      setStep("start");
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <CardTitle>Secure your account</CardTitle>
          <CardDescription>
            Approve this app on Medialane.io to connect your wallet to Medialane Portal.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" onClick={start} disabled={step !== "start"}>
            {step === "start" ? "Start setup" : <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
