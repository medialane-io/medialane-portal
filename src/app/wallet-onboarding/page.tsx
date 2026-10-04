"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { OnboardingFlow } from "@/components/connect/onboarding-flow";
import { safeRelativePath } from "@/lib/safe-redirect";

export default function WalletOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <WalletOnboardingContent />
    </Suspense>
  );
}

function WalletOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRelativePath(searchParams.get("redirect_url")) ?? "/account";

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
        <CardContent>
          <OnboardingFlow
            start="wallet"
            redirectTo={redirectTo}
            onDone={() => setTimeout(() => router.push(redirectTo), 1600)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
