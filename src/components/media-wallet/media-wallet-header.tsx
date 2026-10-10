"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/hooks/use-session";
import { short } from "@/lib/wallet-format";
import { CopyIcon } from "./copy-icon";

export function MediaWalletHeader({ address, onNavigate }: { address: string; onNavigate: () => void }) {
  const { session } = useSession();
  const [copied, setCopied] = useState(false);

  const wallet = session;

  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const headline = short(address);

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
      {wallet?.email && <span className="text-xs text-muted-foreground">{wallet.email}</span>}
    </header>
  );
}
