import { normalizeWalletAddress } from "@medialane/sdk/starknet";

export type RecoveryState = "unknown" | "ready" | "missing";

export interface RecoveryInput {
  devices: number | null;
  guardians: number | null;
  keySaved: boolean;
}

const storageKey = (address: string): string => `medialane.recovery.key-saved.v1:${normalizeWalletAddress(address)}`;

export function recoveryState({ devices, guardians, keySaved }: RecoveryInput): RecoveryState {
  if (keySaved || (devices ?? 0) >= 2 || (guardians ?? 0) > 0) return "ready";
  if (devices === null || guardians === null) return "unknown";
  return "missing";
}

export function loadRecoveryKeySaved(address: string): boolean {
  try {
    return localStorage.getItem(storageKey(address)) === "1";
  } catch {
    return false;
  }
}

export function saveRecoveryKeySaved(address: string): void {
  try {
    localStorage.setItem(storageKey(address), "1");
  } catch {
    return;
  }
}
