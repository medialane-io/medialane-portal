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
import { recoverWalletHere } from "@/lib/wallet/recover-here";
import { loadAccountAddress } from "@/lib/wallet/account-wallet";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const APPROVER_ORIGIN = "https://www.medialane.io";
const APP_NAME = "Medialane Portal";
const PENDING_KEY = "medialane.portal.pending-owner.v1";

type Step = "start" | "creating" | "confirming";
type Notice = { text: string; tone: "info" | "error" };

export default function LinkDevicePage() {
  return (
    <Suspense fallback={null}>
      <LinkDeviceForm />
    </Suspense>
  );
}

function setupFailure(e: unknown): Notice {
  if (e instanceof PasskeyCancelledError) {
    return { text: "Setup was cancelled. Select Start setup to continue.", tone: "info" };
  }

  const raw = e instanceof Error ? e.message : String(e);
  if (/prf/i.test(raw)) {
    return {
      text: "This browser cannot set up a passkey. Try Safari, or Chrome on an up-to-date system.",
      tone: "error",
    };
  }
  if (/relying party|registrable domain|SecurityError/i.test(raw)) {
    return { text: "Setup is unavailable right now. Try again shortly.", tone: "error" };
  }
  return { text: friendlyErrorMessage(e, "Setup did not complete. Try again in a moment."), tone: "error" };
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
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (approval !== "approved") {
      if (approval === "declined") {
        setNotice({ text: "Approval was declined. Select Start setup to continue.", tone: "info" });
      }
      return;
    }

    const pending = loadPending();
    const account = loadAccountAddress();
    if (!pending || !account) {
      setNotice({ text: "That approval could not be matched. Select Start setup to continue.", tone: "error" });
      return;
    }

    setStep("confirming");
    isOwnerOf(account, pending.ownerPubKey)
      .then((owns) => {
        if (!owns) {
          setNotice({ text: "Approval is not confirmed yet. Try again in a moment.", tone: "error" });
          setStep("start");
          return;
        }
        saveSealedOwner({ ...pending, address: account });
        notifyWalletChange();
        sessionStorage.removeItem(PENDING_KEY);
        router.replace(redirectTo ?? "/");
      })
      .catch((e) => {
        setNotice({ text: friendlyErrorMessage(e, "The approval could not be confirmed."), tone: "error" });
        setStep("start");
      });
  }, [approval, redirectTo, router]);

  const start = async () => {
    setNotice(null);
    setStep("creating");
    try {
      const known = loadAccountAddress();
      if (known) {
        const outcome = await recoverWalletHere(known);
        if (outcome === "recovered") {
          router.replace(redirectTo ?? "/");
          return;
        }
        if (outcome === "cancelled") {
          setNotice(setupFailure(new PasskeyCancelledError()));
          setStep("start");
          return;
        }
      }

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
      if (!(e instanceof PasskeyCancelledError)) console.error("[link-device] setup failed", e);
      setNotice(setupFailure(e));
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
            Confirm with your passkey to connect your wallet to Medialane Portal.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {notice ? (
            <p
              className={`mb-3 text-sm ${notice.tone === "error" ? "text-destructive" : "text-muted-foreground"}`}
            >
              {notice.text}
            </p>
          ) : null}
          <Button className="w-full" onClick={start} disabled={step !== "start"}>
            {step === "start" ? "Start setup" : <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
