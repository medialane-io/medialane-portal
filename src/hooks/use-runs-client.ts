"use client";

import { useMemo } from "react";
import { createLaunchpadRunsClient } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export function useRunsClient() {
  return useMemo(
    () =>
      createLaunchpadRunsClient({
        baseUrl: MEDIALANE_BACKEND_URL,
        getToken: async () => null,
      }),
    [],
  );
}
