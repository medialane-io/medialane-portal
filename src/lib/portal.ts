"use client";

import { MEDIALANE_BACKEND_URL } from "@/lib/constants";

export interface AccountSummary {
  id: string;
  accountId: string;
  plan: string;
  status: string;
  creditBalance: number;
}

export interface CreditPayment {
  id: string;
  asset: string;
  amountAtomic: string;
  creditedAmount: number;
  mdlnMultiplier: number;
  txHash: string;
  status: string;
  createdAt: string;
}

export interface SpendByAction {
  actionKey: string;
  credits: number;
  calls: number;
}

export interface SpendSummary {
  recent: Array<{ actionKey: string; credits: number; createdAt: string }>;
  byAction: SpendByAction[];
  spentTotal: number;
  creditedTotal: number;
}

export interface ApiKeySummary {
  id: string;
  prefix: string;
  status: string;
  appSource: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

class PortalError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "PortalError";
  }
}

async function call<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MEDIALANE_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new PortalError(
      (body as { error?: string } | null)?.error ?? "That did not work",
      res.status,
    );
  }
  return (body as { data: T }).data;
}

export const getAccount = (token: string) => call<AccountSummary>("/v1/portal/me", token);
export const getCreditHistory = (token: string) =>
  call<CreditPayment[]>("/v1/portal/credits/history", token);
export const getSpend = (token: string) => call<SpendSummary>("/v1/portal/credits/spend", token);
export const getApiKeys = (token: string) => call<ApiKeySummary[]>("/v1/portal/keys", token);

export const createApiKey = (token: string, appSource?: string) =>
  call<ApiKeySummary & { plaintext: string }>("/v1/portal/keys", token, {
    method: "POST",
    body: JSON.stringify(appSource ? { appSource } : {}),
  });

export const revokeApiKey = (token: string, id: string) =>
  call<{ id: string }>(`/v1/portal/keys/${encodeURIComponent(id)}`, token, { method: "DELETE" });

export const checkDeposit = (token: string, txHash: string) =>
  call<{ deposits: number }>("/v1/portal/credits/check", token, {
    method: "POST",
    body: JSON.stringify({ txHash }),
  });
