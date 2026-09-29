"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import { Button } from "@/components/ui/button";
import { labelForAction } from "@/lib/spend-labels";
import { fundWithChainTransfer } from "@medialane/sdk/starknet";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { topUpUsdcFor } from "@/lib/funding/amount";
import { portalFundingApi } from "@/lib/funding/api";
import { mediaWalletFundingWallet } from "@/lib/funding/wallets";
import type { LaunchpadRun, RunQuote, RunsClient } from "@/lib/launchpad/runs-client";

export function quoteByLabel(quote: RunQuote): { label: string; credits: number }[] {
  const totals = new Map<string, number>();
  for (const line of quote.lines) {
    const label = labelForAction(line.action);
    totals.set(label, (totals.get(label) ?? 0) + line.credits);
  }
  return [...totals.entries()].map(([label, credits]) => ({ label, credits }));
}

export function CheckoutPanel({
  run,
  quote,
  balance,
  signer,
  client,
  onPaid,
}: {
  run: LaunchpadRun;
  quote: RunQuote;
  balance: number | undefined;
  signer: StarknetVenueSigner | null;
  client: RunsClient;
  onPaid: (run: LaunchpadRun) => void;
}) {
  const { getValidToken, signIn } = useSiwsToken();
  const [busy, setBusy] = useState<"credits" | "wallet" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shortfall = Math.max(0, quote.total - (balance ?? 0));
  const coveredByCredits = balance !== undefined && shortfall === 0;

  async function payWithCredits() {
    setBusy("credits");
    setError(null);
    try {
      onPaid(await client.checkoutWithCredits(run.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete checkout.");
    } finally {
      setBusy(null);
    }
  }

  async function payFromWallet() {
    if (!signer) return;
    setBusy("wallet");
    setError(null);
    try {
      const token = getValidToken() ?? (await signIn().catch(() => null));
      const funded = await fundWithChainTransfer(portalFundingApi(token), mediaWalletFundingWallet(signer), {
        amountUsdc: topUpUsdcFor(shortfall > 0 ? shortfall : quote.total),
      });
      if (funded.status !== "SETTLED") {
        throw new Error("Your payment is on chain and will be credited shortly. Pay with credits once it lands.");
      }
      onPaid(await client.checkoutFromWallet(run.id, funded.intentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete the payment.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl bg-muted/40 p-6">
      <div>
        <h2 className="text-lg font-semibold">Checkout</h2>
        <p className="mt-1 text-sm text-muted-foreground">You pay once for the whole run. Anything it does not use comes back to your credits.</p>
      </div>

      <dl className="space-y-2 text-sm">
        {quoteByLabel(quote).map((line) => (
          <div key={line.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className="tabular-nums">{line.credits.toLocaleString()}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{quote.total.toLocaleString()} credits</dd>
        </div>
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Your credits</dt>
          <dd className="tabular-nums">{balance === undefined ? "Loading" : balance.toLocaleString()}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Button onClick={payWithCredits} disabled={busy !== null || !coveredByCredits}>
          {busy === "credits" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Pay with credits
        </Button>
        <Button variant="outline" onClick={payFromWallet} disabled={busy !== null || !signer}>
          {busy === "wallet" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {shortfall > 0 ? "Pay the difference from your wallet" : "Pay from your wallet"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
