"use client";

import { useCallback } from "react";
import { useSession, refreshSession } from "@/hooks/use-session";
import { getMedialaneClient } from "@/lib/medialane-client";
import type { EmailStatus } from "@/lib/settings/rows";

export function useAccountEmail() {
  const { session } = useSession();
  const status: EmailStatus | null = session ? { email: session.email, verified: !session.emailDeadline } : null;

  const markVerified = useCallback(() => void refreshSession(), []);

  const changeEmail = useCallback(async (email: string) => {
    await getMedialaneClient().api.changeMyEmail(email);
    await refreshSession();
  }, []);

  return { status, markVerified, changeEmail };
}
