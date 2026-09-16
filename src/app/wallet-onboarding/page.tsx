"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { getMedialaneClient } from "@/lib/medialane-client";
import { fireConfetti } from "@/lib/confetti";
import { MedialaneApiError } from "@medialane/sdk";
import { safeRelativePath } from "@/lib/safe-redirect";
import { mediaWallet } from "@/lib/wallet/client";

type Step = "creating-passkey" | "deploying" | "signing-in" | "done";

export default function WalletOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <WalletOnboardingForm />
    </Suspense>
  );
}

function WalletOnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRelativePath(searchParams.get("redirect_url")) ?? "/account";
  const [step, setStep] = useState<Step | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const startedRef = useRef(false);

  const runOnboarding = async (options: { forceNew?: boolean } = {}) => {
    setErrorDetail(null);
    try {
      const { siwsToken } = await mediaWallet.completeDeployment(setStep, options);

      await getMedialaneClient().api.upsertMyWallet(siwsToken, {
        walletType: "MEDIAWALLET",
        appSource: "MEDIALANE_PORTAL",
        chain: "STARKNET",
      });

      fireConfetti();
      setStep("done");
      setTimeout(() => router.push(redirectTo), 1600);
    } catch (err) {
      if (err instanceof MedialaneApiError && err.message === "ACCOUNT_LINK_REQUIRED") {
        router.push(`/connect?redirect_url=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(`We couldn't finish setting up your account: ${message}`);
      setErrorDetail(message);
      setStep(null);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startedRef guards this to run exactly once on mount
  }, []);

  if (errorDetail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle>We couldn&apos;t finish setting up your account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <pre className="w-full whitespace-pre-wrap break-all rounded-lg border border-border/60 bg-muted/40 p-3 text-left text-xs text-muted-foreground">
              {errorDetail}
            </pre>
            <div className="flex w-full gap-2">
              <Button className="flex-1" onClick={() => void runOnboarding()}>
                Try again
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => router.push(redirectTo)}>
                Not now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <CardTitle>You&apos;re all set!</CardTitle>
            <CardDescription>Your account is ready.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>Secure your account</CardTitle>
          <CardDescription>Use your passkey, Face ID, or Touch ID to create your unique access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {(step === null || step === "creating-passkey") && "Creating passkey…"}
            {step === "deploying" && "Setting up your wallet…"}
            {step === "signing-in" && "Signing in…"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
