"use client";

import Link from "next/link";
import Image from "next/image";
import { resolveTokenImage } from "@/lib/utils";
import type { NftItem } from "./nft-items";

export function NftStrip({
  items,
  isLoading,
  onNavigate,
}: {
  items: NftItem[];
  isLoading: boolean;
  onNavigate?: () => void;
}) {
  if (isLoading) {
    return (
      <div data-testid="nft-strip-skeleton" className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-foreground/[0.06]" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No NFTs yet — mint or collect your first one to see it here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const resolved = resolveTokenImage(item.image);
        return (
          <Link
            key={item.key}
            href={item.href}
            title={item.name}
            onClick={onNavigate}
            className="group relative aspect-square overflow-hidden rounded-xl bg-foreground/[0.06] transition-opacity hover:opacity-90"
          >
            {resolved ? (
              <Image
                src={resolved}
                alt={item.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <AssetFallbackIcon />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function AssetFallbackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="M21 15l-5-5-9 9" />
    </svg>
  );
}
