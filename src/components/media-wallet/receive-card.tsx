"use client";

import { useState } from "react";
import Image from "next/image";
import { AddressQr } from "./address-qr";
import { CopyIcon } from "./copy-icon";

const FUNDING_DOCS_URL = "https://docs.medialane.io/learn/funding-your-account";

export function ReceiveCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-muted-foreground">Receive assets with your address:</p>

      <button
        onClick={copy}
        className="flex items-center justify-center gap-2 rounded-2xl bg-foreground/[0.06] px-4 py-3.5 text-center transition-colors active:bg-foreground/[0.1]"
      >
        <span className="break-all font-mono text-sm font-medium">{address}</span>
        {copied ? (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">Copied ✓</span>
        ) : (
          <CopyIcon className="shrink-0 opacity-50" />
        )}
      </button>

      <AddressQr value={address} />

      <div className="flex items-center gap-3 rounded-2xl bg-card/40 px-4 py-3 backdrop-blur-sm">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
          <Image src="/Starknet-icon.svg" alt="Starknet" width={20} height={20} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your onchain account is self-custody and permissionless. Please use
          only the Starknet blockchain to send and receive assets.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 pt-1 text-center">
        <p className="text-xs text-muted-foreground">Don&apos;t have tokens yet?</p>
        <a
          href={FUNDING_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-blue/10 px-5 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue/15"
        >
          How to fund your account
        </a>
      </div>
    </div>
  );
}
