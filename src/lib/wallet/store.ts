import type { SealedOwner } from "./passkey";

const STORE_KEY = "medialane-io.wallet.owner.v1";
const EVENT = "mlio-wallet";

export function loadSealedOwner(): SealedOwner | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as SealedOwner) : null;
  } catch {
    return null;
  }
}

export function loadWalletAddress(): string | null {
  return loadSealedOwner()?.address ?? null;
}

export function saveSealedOwner(sealed: SealedOwner): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(sealed));
  window.dispatchEvent(new Event(EVENT));
}

export function notifyWalletChange(): void {
  window.dispatchEvent(new Event(EVENT));
}

export function clearSealedOwner(): void {
  localStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function onWalletChange(fn: () => void): () => void {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
