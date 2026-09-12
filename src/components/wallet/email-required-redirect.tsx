"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification-required";

const EXCLUDED_PREFIXES = ["/connect", "/wallet-onboarding", "/settings"];

export function EmailRequiredRedirect() {
  const { hasWallet } = useWalletNativeSession();
  const status = useEmailVerificationStatus();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedForPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!hasWallet || status === null || status.email !== null) return;
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (redirectedForPathname.current === pathname) return;
    redirectedForPathname.current = pathname;
    router.push(`/connect?redirect_url=${encodeURIComponent(pathname)}`);
  }, [hasWallet, status, pathname, router]);

  return null;
}
