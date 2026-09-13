"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { useMyUsernameClaim } from "@/hooks/use-username-claims";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { getMedialaneClient } from "@/lib/medialane-client";
import { short } from "@/lib/wallet-format";
import { CopyIcon } from "./copy-icon";

export function MediaWalletHeader({ address, onNavigate }: { address: string; onNavigate: () => void }) {
  const { username } = useMyUsernameClaim();
  const { getValidToken } = useSiwsToken();
  const [copied, setCopied] = useState(false);

  const { data: wallet } = useSWR(
    ["media-wallet-header-email", address],
    async () => {
      const token = getValidToken();
      if (!token) return null;
      return getMedialaneClient().api.getMyWallet(token);
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const headline = username ? `@${username}` : short(address);
  const verifiedEmail = wallet?.emailVerified ? wallet.email : null;

  return (
    <header className="flex flex-col items-center gap-2 pt-6">
      <Link
        href="/settings"
        onClick={onNavigate}
        aria-label="Profile and settings"
        className="relative h-20 w-20 shrink-0 transition-transform active:scale-95"
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-foreground/[0.06] ring-2 ring-foreground/10">
          <Image src="/icon.png" alt="" fill unoptimized className="object-cover p-[16%]" />
        </div>
      </Link>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
      >
        {headline}
        {copied ? (
          <span className="text-[10px] font-normal text-muted-foreground">copied ✓</span>
        ) : (
          <CopyIcon className="shrink-0 opacity-50" />
        )}
      </button>
      {verifiedEmail && <span className="text-xs text-muted-foreground">{verifiedEmail}</span>}
    </header>
  );
}
