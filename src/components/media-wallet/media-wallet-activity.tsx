"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ApiWalletActivity, ApiActivity } from "@medialane/sdk";
import { getTokenBySymbol } from "@medialane/sdk";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { getMedialaneClient } from "@/lib/medialane-client";
import { mergeActivityFeeds, type MergedActivityItem } from "@/lib/activity-feed";
import { walletActivityTitle, walletActivitySubtitle, walletActivityAmount } from "@/lib/wallet-activity";
import { short, when, explorerTxUrl, gateway, fmt } from "@/lib/wallet-format";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { BackButton } from "./back-button";
import { WalletActivityIcon } from "./wallet-activity-icon";
import { ActionModal } from "./action-modal";
import type { MediaWalletView } from "./types";

const GRADS = [
  "linear-gradient(135deg,#3b7bff,#8a5cf6)",
  "linear-gradient(135deg,#8a5cf6,#f6608f)",
  "linear-gradient(135deg,#f6608f,#fb8b46)",
  "linear-gradient(135deg,#5b4ce6,#3b7bff)",
];
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return GRADS[Math.abs(h) % GRADS.length];
};

export function MediaWalletActivity({ onNavigate }: { onNavigate: (view: MediaWalletView) => void }) {
  const { address } = useWalletNativeSession();
  const [items, setItems] = useState<MergedActivityItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ApiWalletActivity | null>(null);

  const load = useCallback(() => {
    if (!address) return;
    let live = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const client = getMedialaneClient().api;
        const [walletRes, protocolRes] = await Promise.all([
          client.getWalletActivity(address),
          client.getActivitiesByAddress(address, 1, 50),
        ]);
        if (live) setItems(mergeActivityFeeds(walletRes.data, protocolRes.data));
      } catch (e) {
        if (live) setError(friendlyErrorMessage(e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [address]);

  useEffect(() => load(), [load]);

  return (
    <main className="flex flex-col gap-4 px-5 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <BackButton onBack={() => onNavigate({ name: "home" })} />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">Activity</h1>
      </div>

      {!address && <div className="text-sm text-muted-foreground">No wallet found on this device.</div>}
      {error && <ActivityLoadError onRetry={load} />}
      {loading && !items && !error && <ActivityLoading />}
      {items && items.length === 0 && <div className="text-sm text-muted-foreground">No activity yet.</div>}

      {items && items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item) =>
            item.source === "wallet" ? (
              <WalletActivityRow key={item.data.id} a={item.data} timestamp={item.timestamp} onOpen={setSelected} />
            ) : (
              <ProtocolActivityRow key={`${item.data.txHash}-${item.data.type}`} item={item.data} />
            ),
          )}
        </div>
      )}

      {selected && <ActivityDetailModal a={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function WalletActivityRow({
  a,
  timestamp,
  onOpen,
}: {
  a: ApiWalletActivity;
  timestamp: string;
  onOpen: (a: ApiWalletActivity) => void;
}) {
  const subtitle = walletActivitySubtitle(a);
  const amount = walletActivityAmount(a);
  return (
    <button
      onClick={() => onOpen(a)}
      className="flex items-center gap-3 rounded-2xl bg-card/40 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-card/60"
    >
      <WalletActivityIcon a={a} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{walletActivityTitle(a)}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="shrink-0 text-right">
        {amount && <div className="text-sm font-semibold tabular-nums">{amount}</div>}
        <div className="text-xs text-muted-foreground">{when(timestamp)}</div>
      </div>
    </button>
  );
}

function ActivityDetailModal({ a, onClose }: { a: ApiWalletActivity; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const subtitle = walletActivitySubtitle(a);
  const amount = walletActivityAmount(a);
  const fullDate = new Date(a.timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const copyHash = () => {
    navigator.clipboard?.writeText(a.txHash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ActionModal title={walletActivityTitle(a)} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <WalletActivityIcon a={a} />
          {amount && <div className="text-2xl font-bold tabular-nums">{amount}</div>}
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>

        <div className="flex flex-col divide-y divide-border/40 rounded-2xl bg-foreground/[0.05] px-4">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Date</span>
            <span className="text-sm font-medium">{fullDate}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Transaction</span>
            <button onClick={copyHash} className="font-mono text-sm font-medium transition-opacity active:opacity-60">
              {copied ? "Copied ✓" : short(a.txHash)}
            </button>
          </div>
        </div>

        <a
          href={explorerTxUrl(a.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs font-medium text-muted-foreground underline underline-offset-2"
        >
          View on Voyager ↗
        </a>
      </div>
    </ActionModal>
  );
}

function ProtocolActivityRow({ item }: { item: ApiActivity }) {
  const img = gateway(item.token?.image ?? null);
  const seed = item.txHash ?? item.orderHash ?? item.type;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card/40 px-4 py-3 backdrop-blur-sm">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl" style={img ? undefined : { background: gradFor(seed) }}>
        {img && (
          <Image src={img} alt="" fill className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold capitalize">{item.type}</div>
        {item.token?.name && <div className="truncate text-xs text-muted-foreground">{item.token.name}</div>}
      </div>
      <div className="shrink-0 text-right">
        {item.price?.raw && item.price.currency && (
          <div className="text-sm font-semibold tabular-nums">
            {fmt(BigInt(item.price.raw), getTokenBySymbol(item.price.currency)?.decimals ?? 18)} <span className="text-xs text-muted-foreground">{item.price.currency}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground">{when(item.timestamp)}</div>
      </div>
    </div>
  );
}

function ActivityLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <div className="text-sm text-muted-foreground">Loading your activity…</div>
    </div>
  );
}

function ActivityLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card-base flex flex-col items-center gap-3 px-6 py-8 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.3 3.9L2.3 18a2 2 0 001.7 3h16a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold">Couldn&apos;t load your activity</div>
        <p className="mx-auto mt-1 max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
          There was a problem reaching the server. Check your connection and try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-card"
      >
        Try again
      </button>
    </div>
  );
}
