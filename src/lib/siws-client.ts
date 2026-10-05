"use client";

import {
  requestSiwsToken as sdkRequestSiwsToken,
  getStoredSiwsToken,
  type SiwsSigner,
  type RequestSiwsTokenArgs as SdkRequestSiwsTokenArgs,
} from "@medialane/sdk/starknet";
import { MEDIALANE_BACKEND_URL } from "@/lib/constants";
import { APP_SOURCE } from "@/lib/app-source";

export type { SiwsSigner };
export type RequestSiwsTokenArgs = Omit<SdkRequestSiwsTokenArgs, "backendUrl" | "appSource">;

export { getStoredSiwsToken };

export function requestSiwsToken(args: RequestSiwsTokenArgs): Promise<string> {
  return sdkRequestSiwsToken({ ...args, backendUrl: MEDIALANE_BACKEND_URL, appSource: APP_SOURCE });
}
