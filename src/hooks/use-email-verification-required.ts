"use client";

import useSWR from "swr";
import { useSiwsToken } from "./use-siws-token";
import { useWalletNativeSession } from "./use-wallet-native-session";
import { getMedialaneClient } from "@/lib/medialane-client";

export interface EmailVerificationStatus {
  email: string | null;
  emailVerified: boolean;
  requiresEmailVerification: boolean;
}

export function useEmailVerificationStatus(): EmailVerificationStatus | null {
  const { address } = useWalletNativeSession();
  const { getValidToken } = useSiwsToken();

  const { data } = useSWR(
    address ? ["email-verification-required", address] : null,
    async () => {
      const token = getValidToken();
      if (!token) return null;
      return getMedialaneClient().api.getMyWallet(token);
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  if (!data) return null;
  return {
    email: data.email ?? null,
    emailVerified: data.emailVerified ?? false,
    requiresEmailVerification: data.requiresEmailVerification ?? false,
  };
}

export function useEmailVerificationRequired(): boolean {
  return useEmailVerificationStatus()?.requiresEmailVerification ?? false;
}
