"use client";

import { useMedialaneClient as useMedialaneClientBase } from "@medialane/ui";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { getMedialaneClient } from "@/lib/medialane-client";

export function useMedialaneClient(): MedialaneClient {
  return useMedialaneClientBase(getMedialaneClient);
}
