"use client";

import { useMemo } from "react";
import { createLaunchpadRunsClient } from "@medialane/sdk";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export function useRunsClient() {
  const { getValidToken, signIn } = useSiwsToken();
  return useMemo(
    () =>
      createLaunchpadRunsClient({
        baseUrl: MEDIALANE_BACKEND_URL,
        getToken: async () => getValidToken() ?? (await signIn()),
      }),
    [getValidToken, signIn],
  );
}
