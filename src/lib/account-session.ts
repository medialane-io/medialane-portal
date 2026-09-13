const KEY = "medialane.account.session.v1";
const EVENT = "medialane-account-session";

export function loadAccountSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveAccountSession(token: string): void {
  localStorage.setItem(KEY, token);
  window.dispatchEvent(new Event(EVENT));
}

export function clearAccountSession(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function onAccountSessionChange(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
