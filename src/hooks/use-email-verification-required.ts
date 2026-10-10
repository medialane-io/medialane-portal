"use client";

import { useSession } from "./use-session";

export interface EmailVerificationStatus {
  email: string | null;
  emailVerified: boolean;
  deadline?: string | null;
}

export function useEmailVerificationStatus(): EmailVerificationStatus | null {
  const { session } = useSession();
  if (!session) return null;
  return { email: session.email, emailVerified: !session.emailDeadline, deadline: session.emailDeadline };
}
