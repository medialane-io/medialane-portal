"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import { Button } from "@/components/ui/button";
import { labelForAction } from "@/lib/spend-labels";
import { creditTerms, transferCall } from "@/lib/credits";
import { assertTransactionSucceeded } from "@medialane/sdk/starknet";
import { starknetProvider } from "@/lib/starknet";
import { RunRequestError, type LaunchpadRun, type RunQuote, type RunsClient } from "@/lib/launchpad/runs-client";

export function usdcAtomicFor(credits: number, creditsPerUsdc: number): bigint {
  return BigInt(Math.ceil((credits * 1_000_000) / creditsPerUsdc));
}

export function formatUsdc(atomic: bigint): string {
  const whole = atomic / 1_000_000n;
  const fraction = (atomic % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction.length < 2 ? fraction.padEnd(2, "0") : fraction}` : `${whole}.00`;
}

export function quoteByLabel(quote: RunQuote): { label: string; credits: number }[] {
  const totals = new Map<string, number>();
  for (const line of quote.lines) {
    const label = labelForAction(line.action);
    totals.set(label, (totals.get(label) ?? 0) + line.credits);
  }
  return [...totals.entries()].map(([label, credits]) => ({ label, credits }));
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
      const terms = await creditTerms();
      if (!terms) throw new Error("Wallet payments are not available right now. Try again shortly.");
      const amount = usdcAtomicFor(shortfall > 0 ? shortfall : quote.total, terms.creditsPerUsdc);
      const { txHash } = await signer.execute([transferCall(terms, amount)]);
      await assertTransactionSucceeded(starknetProvider, txHash);

      for (let attempt = 0; ; attempt++) {
        try {
          onPaid(await client.checkoutFromWallet(run.id, txHash));
          return;
        } catch (e) {
          if (e instanceof RunRequestError && e.status === 402 && attempt < 5) {
            await pause(3000);
            continue;
          }
          throw e;
        }
      }
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
