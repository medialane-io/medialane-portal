"use client";

import { useState } from "react";
import { ActionButton } from "@medialane/ui";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { completeWalletDeployment } from "@/lib/wallet/complete-deployment";

const BRAND_GRADIENT = "linear-gradient(115deg,#3b7bff,#8a5cf6,#f6608f,#fb8b46,#3b7bff)";

export function ActivateCard({ onActivated }: { onActivated: (txHash?: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async () => {
    setError(null);
    setBusy(true);
    try {
      await completeWalletDeployment(() => {});
      onActivated();
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-base p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <ActionButton
          action="buy"
          big
          onClick={activate}
          disabled={busy}
          className="w-full disabled:opacity-40 disabled:pointer-events-none"
          style={{ "--ml-grad": BRAND_GRADIENT } as React.CSSProperties}
        >
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/25 border-t-foreground" />}
          Activate my wallet
        </ActionButton>
        <p className="mx-auto max-w-[22rem] text-sm leading-relaxed text-muted-foreground">
          Your account is stored securely and ready whenever you need it. Activating is free — no gas fees.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
