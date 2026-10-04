"use client";

import { useEmailCode as useSharedEmailCode, type EmailCode } from "@medialane/ui";
import { getMedialaneClient } from "@/lib/medialane-client";

export type { EmailCode };

const api = () => getMedialaneClient().api;

export function useEmailCode(email: string | null): EmailCode {
  return useSharedEmailCode(email, api);
}
