"use client";

import { CurrencyIcon } from "@medialane/ui";
import { ActionModal } from "./action-modal";
import { fmt } from "@/lib/wallet-format";
import type { WalletToken } from "./wallet-tokens";

export function CurrencySheet({
  title,
  tokens,
  balances,
  onSelect,
  onClose,
}: {
  title: string;
  tokens: WalletToken[];
  balances: Record<string, bigint | null>;
  onSelect: (token: WalletToken) => void;
  onClose: () => void;
}) {
  return (
    <ActionModal title={title} onClose={onClose}>
      <div className="flex flex-col divide-y divide-border/40">
        {tokens.map((t) => (
          <button
            key={t.symbol}
            onClick={() => onSelect(t)}
            className="flex items-center gap-3 py-3 text-left transition-opacity active:opacity-70"
          >
            <CurrencyIcon symbol={t.symbol} size={28} />
            <div className="min-w-0 flex-1 text-sm font-semibold">{t.symbol}</div>
            <div className="text-sm font-semibold tabular-nums text-muted-foreground">
              {balances[t.symbol] != null ? fmt(balances[t.symbol]!, t.decimals) : "…"}
            </div>
          </button>
        ))}
      </div>
    </ActionModal>
  );
}
