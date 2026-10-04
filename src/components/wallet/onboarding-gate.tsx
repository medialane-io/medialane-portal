"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification-required";
import { mediaWallet } from "@/lib/wallet/client";
import { resolveOnboardingRedirect } from "@/lib/wallet/onboarding-gate";

export function OnboardingGate() {
  const { hasWallet, isDeployed } = useWalletNativeSession();
  const emailStatus = useEmailVerificationStatus();
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirect = useRef<string | null>(null);

  useEffect(() => {
    const target = resolveOnboardingRedirect({
      pathname,
      hasWallet,
      isDeployed,
      isDeploying: mediaWallet.isDeploying(),
      emailStatus,
    });
    if (!target || lastRedirect.current === target) return;
    lastRedirect.current = target;
    router.push(target);
  }, [hasWallet, isDeployed, emailStatus, pathname, router]);

  return null;
}
