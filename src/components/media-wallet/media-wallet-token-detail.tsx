"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiWalletActivity } from "@medialane/sdk";
import { CurrencyIcon } from "@medialane/ui";
import { normalizeAddress } from "@medialane/sdk";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useErc20Balance } from "@/hooks/use-erc20-balance";
import { getMedialaneClient } from "@/lib/medialane-client";
import { fmt, fmtUsd, rawToNumber, short, when, explorerTokenUrl } from "@/lib/wallet-format";
import { walletActivityTitle, walletActivitySubtitle, walletActivityAmount } from "@/lib/wallet-activity";
import { BackButton } from "./back-button";
import { QuickAction } from "./quick-action";
import { SectionHeader } from "./section-header";
import { WalletActivityIcon } from "./wallet-activity-icon";
import { useUsdPrices, usdPriceFor } from "@/hooks/use-usd-prices";
import type { WalletToken } from "./wallet-tokens";
import type { MediaWalletView } from "./types";

export function MediaWalletTokenDetail({
  token,
  onNavigate,
}: {
  token: WalletToken;
  onNavigate: (view: MediaWalletView) => void;
}) {
  const { address: walletAddress } = useWalletNativeSession();
  const { rawBalance: bal } = useErc20Balance(token.address, walletAddress);
  const usdPrices = useUsdPrices();
  const price = usdPriceFor(usdPrices, token.symbol) ?? null;

  const voyager = useMemo(() => explorerTokenUrl(token.address), [token.address]);
  const heldValue = bal != null && price != null ? rawToNumber(bal, token.decimals) * price : null;

  return (
    <main className="flex flex-col gap-6 px-5 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <BackButton onBack={() => onNavigate({ name: "home" })} />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-foreground/[0.06]">
            <CurrencyIcon symbol={token.symbol} size={26} />
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg font-bold leading-none">{token.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{token.symbol}</div>
          </div>
        </div>
      </div>

      <section className="py-2 text-center">
        <div className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight tabular-nums">
          {bal === undefined ? "…" : bal === null ? "—" : fmt(bal, token.decimals, 6)}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {token.symbol}
          {" · "}
          {heldValue != null ? fmtUsd(heldValue) : "—"}
        </div>
        {price != null && <div className="mt-0.5 text-xs text-muted-foreground">{fmtUsd(price)} per {token.symbol}</div>}
      </section>

      <div className="grid grid-cols-2 gap-2">
        <QuickAction
          label="Send"
          action="offer"
          onClick={() => onNavigate({ name: "send", token })}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>}
        />
        <QuickAction
          label="Receive"
          action="buy"
          onClick={() => onNavigate({ name: "home" })}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>}
        />
      </div>

      <TokenActivity tokenAddress={token.address} walletAddress={walletAddress} />

      <section>
        <SectionHeader title="Details" />
        <div className="mt-2 flex flex-col divide-y divide-border/40 rounded-2xl bg-card/40 px-4 backdrop-blur-sm">
          <InfoRow
            label="Network"
            value={
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                  <CurrencyIcon symbol="STRK" size={14} />
                </span>
                Starknet
              </span>
            }
          />
          <InfoRow label="Standard" value="ERC-20" />
          <InfoRow
            label="Contract"
            value={
              <a href={voyager} target="_blank" rel="noopener noreferrer" className="font-mono text-brand-blue hover:underline">
                {short(token.address)} ↗
              </a>
            }
          />
        </div>
      </section>
    </main>
  );
}

function TokenActivity({ tokenAddress, walletAddress }: { tokenAddress: string; walletAddress: string | null }) {
  const [items, setItems] = useState<ApiWalletActivity[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    const normalizedToken = normalizeAddress("STARKNET", tokenAddress);
    getMedialaneClient()
      .api.getWalletActivity(walletAddress)
      .then((res) => {
        const filtered = res.data
          .filter((a) => (a.type === "SEND" || a.type === "RECEIVE") && a.tokenAddress && normalizeAddress("STARKNET", a.tokenAddress) === normalizedToken)
          .slice(0, 5);
        setItems(filtered);
      })
      .catch(() => setError(true));
  }, [walletAddress, tokenAddress]);

  if (error || (items && items.length === 0)) return null;

  return (
    <section>
      <SectionHeader title="Activity" />
      <div className="mt-2">
        {items === null ? (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-foreground/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((a) => {
              const subtitle = walletActivitySubtitle(a);
              const amount = walletActivityAmount(a);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-card/40 px-4 py-3 backdrop-blur-sm">
                  <WalletActivityIcon a={a} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{walletActivityTitle(a)}</div>
                    {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    {amount && <div className="text-sm font-semibold tabular-nums">{amount}</div>}
                    <div className="text-xs text-muted-foreground">{when(a.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
