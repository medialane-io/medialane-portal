"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CurrencyIcon } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useTokenBalance } from "@/hooks/use-erc20-balance";
import { useTokensByOwner } from "@/hooks/use-tokens";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification-required";
import { ActivateCard } from "./activate-card";
import { QuickAction } from "./quick-action";
import { ReceiveCard } from "./receive-card";
import { ActionModal } from "./action-modal";
import { SectionHeader } from "./section-header";
import { SuccessDialog } from "./success-dialog";
import { MediaWalletHeader } from "./media-wallet-header";
import { WALLET_TOKENS, type WalletToken } from "./wallet-tokens";
import { pickNftItems } from "./nft-items";
import { NftStrip } from "./nft-strip";
import { useUsdPrices, usdPriceFor } from "@/hooks/use-usd-prices";
import { fmt, fmtUsd, rawToNumber } from "@/lib/wallet-format";
import type { MediaWalletView } from "./types";

export function MediaWalletHome({
  onNavigate,
  onClose,
  autoOpenReceive,
}: {
  onNavigate: (view: MediaWalletView) => void;
  onClose: () => void;
  autoOpenReceive?: boolean;
}) {
  const { address, isDeployed } = useWalletNativeSession();
  const router = useRouter();
  const emailStatus = useEmailVerificationStatus();
  const needsEmailVerification = !!emailStatus?.email && !emailStatus.emailVerified;

  const balances: Record<WalletToken["symbol"], ReturnType<typeof useTokenBalance>> = {
    STRK: useTokenBalance("STRK", address),
    ETH: useTokenBalance("ETH", address),
    USDC: useTokenBalance("USDC", address),
    WBTC: useTokenBalance("WBTC", address),
  };

  const { tokens, isLoading: loadingNfts } = useTokensByOwner(address, 1, 6);
  const nftItems = pickNftItems(tokens, 6);

  const usdPrices = useUsdPrices();
  const [panel, setPanel] = useState<"receive" | null>(autoOpenReceive ? "receive" : null);
  const [hideBalances, setHideBalances] = useState(false);
  const [activated, setActivated] = useState(false);
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHideBalances(localStorage.getItem("mediawallet.hideBalances") === "1");
  }, []);

  const scrollParent = () => mainRef.current?.parentElement ?? null;
  const onTouchStart = (e: React.TouchEvent) => {
    const sc = scrollParent();
    startY.current = sc && sc.scrollTop <= 0 ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.5, 90));
  };
  const onTouchEnd = () => {
    setPull(0);
    startY.current = null;
  };

  const usd = (symbol: WalletToken["symbol"]) => {
    const { rawBalance, decimals } = balances[symbol];
    return rawToNumber(rawBalance, decimals) * (usdPriceFor(usdPrices, symbol) ?? 0);
  };
  const totalUsd = WALLET_TOKENS.reduce((sum, t) => sum + usd(t.symbol), 0);
  const heldTokens = WALLET_TOKENS.filter((t) => (balances[t.symbol].rawBalance ?? 0n) > 0n);

  const strkBalance = balances.STRK.rawBalance;
  const funded = strkBalance != null && strkBalance > 0n;
  const canSend = isDeployed === true && funded;

  const goLaunch = () => {
    onClose();
    router.push("/launchpad");
  };

  return (
    <main
      ref={mainRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative flex min-h-full flex-col gap-6 px-5 pb-8 pt-2"
      style={{ transform: pull ? `translateY(${pull}px)` : undefined, transition: pull ? "none" : "transform 0.2s ease" }}
    >
      {address && (
        <div className="flex flex-col items-center gap-4">
          <MediaWalletHeader address={address} onNavigate={onClose} />
          {(funded || isDeployed === false) && (
            <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight tabular-nums">
              {hideBalances ? "••••" : usdPrices === null ? "…" : fmtUsd(totalUsd)}
            </span>
          )}
        </div>
      )}

      {funded ? (
        <div className="grid grid-cols-4 gap-2">
          <QuickAction label="Send" action="buy" disabled={!canSend} onClick={() => onNavigate({ name: "send" })} icon={<ArrowUp />} />
          <QuickAction label="Receive" action="offer" onClick={() => setPanel(panel === "receive" ? null : "receive")} icon={<ArrowDown />} />
          <QuickAction label="Launch" action="remix" onClick={goLaunch} icon={<RocketIcon />} />
          <QuickAction label="Activity" action="submit" onClick={() => onNavigate({ name: "activity" })} icon={<ActivityIcon />} />
        </div>
      ) : isDeployed === null ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-3 w-16 animate-pulse rounded bg-foreground/[0.06]" />
            <div className="h-11 w-32 animate-pulse rounded bg-foreground/[0.06]" />
            <div className="h-[48px] w-40 animate-pulse rounded-[13px] bg-foreground/[0.06]" />
          </div>
          <div className="h-[148px] animate-pulse rounded-[20px] bg-foreground/[0.04]" />
        </div>
      ) : (
        isDeployed === true && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balance</span>
              <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight tabular-nums">
                {hideBalances ? "••••" : usdPrices === null ? "…" : fmtUsd(totalUsd)}
              </span>
              <button
                onClick={() => setPanel(panel === "receive" ? null : "receive")}
                className="h-[48px] rounded-[13px] px-8 text-[15px] font-semibold text-white transition-transform active:scale-[0.99]"
                style={{ background: "linear-gradient(115deg,#3b7bff,#5b4ce6)" }}
              >
                Fund your account
              </button>
            </div>
            <button
              onClick={goLaunch}
              className="flex flex-col items-center gap-2 rounded-[20px] border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary/50 active:scale-[0.99]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground/[0.06]">
                <RocketIcon />
              </div>
              <span className="text-[15px] font-semibold text-foreground">Creator Launchpad</span>
              <span className="text-xs text-muted-foreground">Protect and monetize your work</span>
            </button>
          </div>
        )
      )}

      {isDeployed === false && <ActivateCard onActivated={() => setActivated(true)} />}

      {needsEmailVerification && (
        <Link
          href="/verify"
          onClick={onClose}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(115deg, hsl(var(--brand-orange) / 0.12), hsl(var(--brand-maeve, 327 64% 67%) / 0.12))" }}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-orange/15">
            <MailIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Verify your email</div>
            <div className="text-xs text-muted-foreground">Validate to access all the platform features</div>
          </div>
        </Link>
      )}

      {panel === "receive" && address && (
        <ActionModal onClose={() => setPanel(null)}>
          <ReceiveCard address={address} />
        </ActionModal>
      )}

      {heldTokens.length > 0 && (
        <section>
          <SectionHeader title="Tokens" />
          <div className="mt-2 flex flex-col gap-2">
            {heldTokens.map((t) => {
              const { rawBalance, decimals } = balances[t.symbol];
              return (
                <button
                  key={t.symbol}
                  onClick={() => onNavigate({ name: "token", token: t })}
                  className="flex items-center gap-3 rounded-2xl bg-card/40 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-card/60"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                    <CurrencyIcon symbol={t.symbol} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.symbol}</div>
                    <div className="text-xs text-muted-foreground">{t.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{hideBalances ? "••••" : fmt(rawBalance, decimals)}</div>
                    {!hideBalances && usdPrices !== null && (
                      <div className="text-xs text-muted-foreground tabular-nums">{fmtUsd(usd(t.symbol))}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {(nftItems.length > 0 || loadingNfts) && (
        <section>
          <SectionHeader title="NFTs" />
          <div className="mt-2">
            <NftStrip items={nftItems} isLoading={loadingNfts} onNavigate={onClose} />
          </div>
        </section>
      )}

      {activated && (
        <SuccessDialog
          title="Account activated"
          message="Your account is live and ready to use"
          onClose={() => setActivated(false)}
        />
      )}

      <a
        href="https://starknet.medialane.io"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-center text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        Use another Starknet wallet
      </a>
    </main>
  );
}

function ArrowUp() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
