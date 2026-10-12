import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toDisplayUrlOrNull, PINATA_PUBLIC_GATEWAY } from "@medialane/ui";
import { IPFS_GATEWAY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const displayOptions = { gateway: IPFS_GATEWAY ?? PINATA_PUBLIC_GATEWAY };

export function resolveTokenImage(raw: string | null | undefined): string | null {
  return toDisplayUrlOrNull(raw, displayOptions);
}

