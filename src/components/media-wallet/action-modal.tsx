"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const MEDIA_WALLET_PORTAL_ID = "media-wallet-canvas";

export function CanvasPortal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEl(document.getElementById(MEDIA_WALLET_PORTAL_ID));
  }, []);
  return el ? createPortal(children, el) : null;
}

export function ActionBackdrop({ onClose }: { onClose?: () => void }) {
  return <div className="absolute inset-0 bg-transparent backdrop-blur-xl" onClick={onClose} />;
}

export function ActionModal({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <CanvasPortal>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
        <ActionBackdrop onClose={onClose} />
        <div className="relative z-10 w-full max-w-[360px] rounded-3xl bg-card p-5">
          <div className={`mb-4 flex items-center ${title ? "justify-between" : "justify-end"}`}>
            {title && (
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">{title}</h2>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </CanvasPortal>
  );
}

export function BusyOverlay({ label }: { label: string }) {
  return (
    <CanvasPortal>
      <div className="absolute inset-0 z-[60] grid place-items-center">
        <ActionBackdrop />
        <div className="glass relative z-10 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          {label}
        </div>
      </div>
    </CanvasPortal>
  );
}
