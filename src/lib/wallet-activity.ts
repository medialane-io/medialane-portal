import { getTokenByAddress } from "@medialane/sdk";
import type { ApiWalletActivity } from "@medialane/sdk";
import { fmt, short } from "@/lib/wallet-format";

function tokenAmount(tokenAddress: string | null, amount: string | null): string | null {
  if (!amount) return null;
  const token = tokenAddress ? getTokenByAddress(tokenAddress) : undefined;
  if (!token) return amount;
  return `${fmt(BigInt(amount), token.decimals)} ${token.symbol}`;
}

export function walletActivityTitle(a: ApiWalletActivity): string {
  switch (a.type) {
    case "SEND": return "Sent";
    case "RECEIVE": return "Received";
    case "SWAP": return "Swapped";
    case "DEPLOY": return "Account activated";
    case "GUARDIAN_SET": return "Guardian added";
    case "GUARDIAN_TRIGGER_ESCAPE": return "Recovery started";
    case "GUARDIAN_COMPLETE_ESCAPE": return "Recovery completed";
    case "GUARDIAN_CANCEL_ESCAPE": return "Recovery canceled";
    default: {
      const exhaustive: never = a.type;
      throw new Error(`Unhandled WalletActivityType: ${exhaustive}`);
    }
  }
}

export function walletActivitySubtitle(a: ApiWalletActivity): string | null {
  switch (a.type) {
    case "SEND": return a.counterparty ? `to ${short(a.counterparty)}` : null;
    case "RECEIVE": return a.counterparty ? `from ${short(a.counterparty)}` : null;
    case "SWAP": {
      const from = tokenAmount(a.tokenInAddress, a.amountIn);
      const to = tokenAmount(a.tokenOutAddress, a.amountOut);
      return from && to ? `${from} → ${to}` : null;
    }
    default: return null;
  }
}

export function walletActivityAmount(a: ApiWalletActivity): string | null {
  if (a.type === "SEND" || a.type === "RECEIVE") return tokenAmount(a.tokenAddress, a.amount);
  return null;
}
