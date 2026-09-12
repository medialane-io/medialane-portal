import type { Call } from "starknet";
import { estimateSelfFundedFee } from "./self-funded";

export interface SelfFundFeeEstimate {
  feeRaw: bigint;
  unit: string;
}

type Handler = (feeEstimate: Promise<SelfFundFeeEstimate | null>) => Promise<boolean>;
let currentHandler: Handler | null = null;

export function registerSelfFundConsentHandler(handler: Handler | null): void {
  currentHandler = handler;
}

export async function requestSelfFundConsent(address?: string, calls?: Call[]): Promise<boolean> {
  if (!currentHandler) return false;
  const feeEstimate =
    address && calls
      ? estimateSelfFundedFee(address, calls).catch(() => null)
      : Promise.resolve(null);
  return currentHandler(feeEstimate);
}
