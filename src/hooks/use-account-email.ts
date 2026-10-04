"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { getMedialaneClient } from "@/lib/medialane-client";
import { saveAccountEmail } from "@/lib/wallet/account-wallet";
import type { EmailStatus } from "@/lib/settings/rows";

export function useAccountEmail() {
  const { address } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const [status, setStatus] = useState<EmailStatus | null>(null);

  const load = useCallback(async (token: string) => {
    const result = await getMedialaneClient().api.getMyWallet(token);
    if (result) setStatus({ email: result.email ?? null, verified: result.emailVerified ?? false });
  }, []);

  useEffect(() => {
    if (!address) return;
    const token = getValidToken();
    if (token) void load(token).catch(() => {});
  }, [address, getValidToken, load]);

  const unlock = useCallback(async () => {
    const token = getValidToken() ?? (await signIn());
    if (token) await load(token);
  }, [getValidToken, signIn, load]);

  const markVerified = useCallback(() => setStatus((s) => (s ? { ...s, verified: true } : s)), []);

  const changeEmail = useCallback(
    async (email: string) => {
      const token = getValidToken() ?? (await signIn());
      if (!token) throw new Error("Not authenticated");
      const result = await getMedialaneClient().api.changeMyEmail(email, token);
      saveAccountEmail(email);
      setStatus({ email: result.email, verified: result.emailVerified });
    },
    [getValidToken, signIn],
  );

  return { status, unlock, markVerified, changeEmail };
}
