"use client";

import { useEffect, useState } from "react";
import { ActionDialog } from "@medialane/ui";
import { registerSelfFundConsentHandler, type SelfFundFeeEstimate } from "@/lib/wallet/self-fund-consent";
import { fmt } from "@/lib/wallet-format";

interface PendingRequest {
  resolve: (consented: boolean) => void;
  feeEstimate: SelfFundFeeEstimate | null | "loading";
}

export function SelfFundConsentDialog() {
  const [pending, setPending] = useState<PendingRequest | null>(null);

  useEffect(() => {
    registerSelfFundConsentHandler((feeEstimatePromise) => {
      return new Promise<boolean>((resolve) => {
        setPending({ resolve, feeEstimate: "loading" });
        void feeEstimatePromise.then((feeEstimate) => {
          setPending((current) => (current ? { ...current, feeEstimate } : current));
        });
      });
    });
    return () => registerSelfFundConsentHandler(null);
  }, []);

  const respond = (consented: boolean) => {
    pending?.resolve(consented);
    setPending(null);
  };

  const feeLabel =
    pending?.feeEstimate === "loading" || pending?.feeEstimate == null
      ? null
      : `${fmt(pending.feeEstimate.feeRaw, 18, 6)} ${pending.feeEstimate.unit === "FRI" ? "STRK" : "ETH"}`;

  return (
    <ActionDialog open={pending !== null} onClose={() => respond(false)} width={420} shadow={false}>
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pay this transaction</h2>
        <p className="text-sm text-muted-foreground">
          This transaction will cover onchain fees with funds from your account.
        </p>
        <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated cost</span>
          <span className="text-sm font-semibold">{feeLabel ?? "Estimating…"}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => respond(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => respond(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Pay with my wallet
          </button>
        </div>
      </div>
    </ActionDialog>
  );
}
