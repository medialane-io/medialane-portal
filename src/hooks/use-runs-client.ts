"use client";

import { useMemo } from "react";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { createRunsClient } from "@/lib/launchpad/runs-client";

export function useRunsClient() {
  const { getValidToken, signIn } = useSiwsToken();
  return useMemo(
    () => createRunsClient(async () => getValidToken() ?? (await signIn())),
    [getValidToken, signIn],
  );
}
