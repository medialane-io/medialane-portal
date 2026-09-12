"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CurrencyIcon } from "@medialane/ui";
import { MediaWallet } from "./media-wallet";
import { MEDIA_WALLET_PORTAL_ID } from "./action-modal";
import type { MediaWalletView } from "./types";

const WL_OPEN = "ml:media-wallet-open";
const WL_CLOSE = "ml:media-wallet-close";

export function useMediaWallet() {
  return {
    open: (view?: MediaWalletView) =>
      document.dispatchEvent(new CustomEvent<MediaWalletView | undefined>(WL_OPEN, { detail: view })),
    close: () => document.dispatchEvent(new CustomEvent(WL_CLOSE)),
  };
}

export function MediaWalletOverlay() {
  const [open, setOpen] = React.useState(false);
  const [initialView, setInitialView] = React.useState<MediaWalletView | undefined>(undefined);

  React.useEffect(() => {
    const onOpen = (e: Event) => {
      setInitialView((e as CustomEvent<MediaWalletView | undefined>).detail);
      setOpen(true);
    };
    const onClose = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener(WL_OPEN, onOpen);
    document.addEventListener(WL_CLOSE, onClose);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener(WL_OPEN, onOpen);
      document.removeEventListener(WL_CLOSE, onClose);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="nav-canvas-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />
          <motion.div
            className="fixed inset-0 z-[101] flex items-end justify-center p-3 pb-4 sm:items-center sm:p-4"
            initial={{ opacity: 0, y: 24, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={close}
          >
            <div
              id={MEDIA_WALLET_PORTAL_ID}
              className={
                "relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-[32px] " +
                "aspect-[9/19.5] max-h-[85dvh] " +
                "bg-background"
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
                <Link
                  href="/settings"
                  onClick={close}
                  aria-label="Settings"
                  className="grid h-8 w-8 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <CurrencyIcon symbol="STRK" size={16} />
                </Link>
                <button
                  onClick={close}
                  aria-label="Close wallet"
                  className="grid h-8 w-8 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <MediaWallet onClose={close} initialView={initialView} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
