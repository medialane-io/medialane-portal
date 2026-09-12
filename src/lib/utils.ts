import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { normalizeAddress } from "@medialane/sdk";
import { toDisplayUrl, toDisplayUrlOrNull, PINATA_PUBLIC_GATEWAY } from "@medialane/ui";
import { IPFS_GATEWAY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function adaptiveDecimals(num: number): number {
  if (num === 0 || num >= 1) return 2;
  if (num >= 0.01) return 4;

  const leadingZeros = Math.floor(-Math.log10(Math.abs(num)));
  return leadingZeros + 2;
}

export function formatDisplayPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return "";

  const priceStr = String(price);
  const parts = priceStr.split(" ");
  const numericPart = parts[0];
  const currencyPart = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const num = Number(numericPart);
  if (isNaN(num)) return priceStr;

  const maxDecimals = adaptiveDecimals(num);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(2, maxDecimals),
    maximumFractionDigits: maxDecimals,
  });

  return currencyPart ? `${formatted} ${currencyPart}` : formatted;
}

const displayOptions = { gateway: IPFS_GATEWAY ?? PINATA_PUBLIC_GATEWAY };

export function ipfsToHttp(uri: string | null | undefined): string {
  return toDisplayUrl(uri, displayOptions);
}

export function resolveTokenImage(raw: string | null | undefined): string | null {
  return toDisplayUrlOrNull(raw, displayOptions);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function checkIsOwner(
  token: { owner?: string | null; balances?: Array<{ owner: string; amount: string }> | null } | null | undefined,
  walletAddress: string | null | undefined
): boolean {
  if (!token || !walletAddress) return false;
  const normalizedWallet = normalizeAddress("STARKNET", walletAddress);
  if (token.balances != null && token.balances.length > 0) {
    return token.balances.some(
      (b) => normalizeAddress("STARKNET", b.owner) === normalizedWallet && BigInt(b.amount) > 0n
    );
  }
  if (!token.owner) return false;
  return normalizeAddress("STARKNET", token.owner) === normalizedWallet;
}

export function formatExpiry(endTime: string | bigint): { label: string; urgent: boolean; expired: boolean } {
  const expiry = new Date(Number(endTime) * 1000);
  const now = new Date();
  if (expiry < now) return { label: "Expired", urgent: false, expired: true };
  const urgent = expiry.getTime() - now.getTime() < 86400000;
  return { label: formatDistanceToNow(expiry, { addSuffix: true }), urgent, expired: false };
}

export function timeUntil(dateStr: string | number): string {

  const raw = typeof dateStr === "string" && /^\d+$/.test(dateStr.trim())
    ? Number(dateStr)
    : dateStr;
  const ms = typeof raw === "number" ? raw * 1000 : new Date(raw).getTime();
  const diff = ms - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}
