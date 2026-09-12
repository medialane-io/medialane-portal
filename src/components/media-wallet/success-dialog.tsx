"use client";

import { useEffect } from "react";
import { ActionButton } from "@medialane/ui";
import { ActionBackdrop, CanvasPortal } from "./action-modal";
import { fireConfetti } from "@/lib/confetti";
import { explorerTxUrl } from "@/lib/wallet-format";

const BRAND_GRADIENT = "linear-gradient(115deg, #3b7bff, #8a5cf6, #f6608f, #fb8b46, #3b7bff)";

export function SuccessDialog({
  title,
  message,
  actionLabel = "Done",
  txHash,
  onClose,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  txHash?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    fireConfetti();
  }, []);
  return (
    <CanvasPortal>
      <div className="absolute inset-0 z-[70] grid place-items-center p-6" onClick={onClose}>
        <ActionBackdrop />
        <div className="card-base relative z-10 w-full max-w-[320px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white"
            style={{ background: BRAND_GRADIENT }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message}</p>
          {txHash && (
            <a
              href={explorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-brand-blue hover:underline"
            >
              View on Voyager ↗
            </a>
          )}
          <ActionButton big onClick={onClose} className="mt-5 w-full" style={{ "--ml-grad": BRAND_GRADIENT } as React.CSSProperties}>
            {actionLabel}
          </ActionButton>
        </div>
      </div>
    </CanvasPortal>
  );
}
