const ACCOUNT_ADDRESS_KEY = "medialane.account.address.v1";
const ACCOUNT_EMAIL_KEY = "medialane.account.email.v1";

export function loadAccountAddress(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCOUNT_ADDRESS_KEY);
  } catch {
    return null;
  }
}

export function saveAccountAddress(address: string): void {
  localStorage.setItem(ACCOUNT_ADDRESS_KEY, address);
}

export function clearAccountAddress(): void {
  localStorage.removeItem(ACCOUNT_ADDRESS_KEY);
  localStorage.removeItem(ACCOUNT_EMAIL_KEY);
}

export function loadAccountEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCOUNT_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function saveAccountEmail(email: string): void {
  const value = email.trim().toLowerCase();
  if (value) localStorage.setItem(ACCOUNT_EMAIL_KEY, value);
}

export async function fetchAccountWalletAddress(): Promise<string | null> {
  const res = await fetch("/api/proxy/v1/users/me/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { walletAddress?: string | null };
  return data.walletAddress ?? null;
}

export async function adoptAccountWallet(): Promise<boolean> {
  const address = await fetchAccountWalletAddress();
  if (!address) return false;
  saveAccountAddress(address);
  return true;
}
