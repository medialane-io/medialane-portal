"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { ValuePropCarousel } from "@/components/connect/value-prop-carousel";
import { OnboardingFlow } from "@/components/connect/onboarding-flow";
import { safeRelativePath } from "@/lib/safe-redirect";

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectContent />
    </Suspense>
  );
}

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRelativePath(searchParams.get("redirect_url"));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Connect with your email</CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingFlow
              redirectTo={redirectTo}
              onDone={({ celebrated }) => {
                const go = () => router.replace(redirectTo ?? "/account");
                if (celebrated) setTimeout(go, 1600);
                else go();
              }}
            />
          </CardContent>
        </Card>
        <ValuePropCarousel />
      </div>
    </div>
  );
}
