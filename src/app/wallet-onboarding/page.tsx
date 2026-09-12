"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { completeWalletDeployment } from "@/lib/wallet/complete-deployment";
import { getMedialaneClient } from "@/lib/medialane-client";
import { fireConfetti } from "@/lib/confetti";
import { MedialaneApiError } from "@medialane/sdk";
import { safeRelativePath } from "@/lib/safe-redirect";

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
  const redirectTo = safeRelativePath(searchParams.get("redirect_url")) ?? "/airdrop";
  const [step, setStep] = useState<Step | null>(null);
  const startedRef = useRef(false);

  const runOnboarding = async () => {
    try {
      const { siwsToken } = await completeWalletDeployment(setStep);

      await getMedialaneClient().api.upsertMyWallet(siwsToken, {
        walletType: "MEDIAWALLET",
        appSource: "MEDIALANE_IO",
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

      toast.error("We couldn't finish setting up your account. You can pick up where you left off from your wallet.");
      router.push(redirectTo);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startedRef guards this to run exactly once on mount
  }, []);

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
