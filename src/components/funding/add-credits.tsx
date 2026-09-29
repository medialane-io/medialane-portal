"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { fundWithChainTransfer, type FundingStep, type FundingWallet } from "@medialane/sdk/starknet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { usdPriceFor, useUsdPrices } from "@/hooks/use-usd-prices";
import { tokenAmountEstimate } from "@/lib/funding/estimate";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { portalFundingApi } from "@/lib/funding/api";
import { InsufficientFundsError, insufficientFundsCopy } from "@/lib/funding/balance";
import {
  connectExternalWallet,
  listExternalWallets,
  mediaWalletFundingWallet,
  type ExternalWallet,
} from "@/lib/funding/wallets";

const STEP_COPY: Record<FundingStep, string> = {
  creating: "Starting your top-up",
  signing: "Confirm in your wallet",
  authorizing: "Checking your wallet",
  paying: "Approve the transfer in your wallet",
  confirming: "Waiting for the transfer to land",
};

const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;

/** Tokens offered here. The backend decides what it accepts and credits what arrives at its dollar value. */
const TOKENS = ["USDC", "ETH", "STRK", "USDT"] as const;

export function AddCredits({ balance, onCredited }: { balance: number | undefined; onCredited: () => void }) {
  const { signer } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const usdPrices = useUsdPrices();
  const [amount, setAmount] = useState("10");
  const [token, setToken] = useState<(typeof TOKENS)[number]>("USDC");
  const [external, setExternal] = useState<ExternalWallet[]>([]);
  const [step, setStep] = useState<FundingStep | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    listExternalWallets().then(setExternal).catch(() => setExternal([]));
  }, []);

  const valid = AMOUNT.test(amount) && Number(amount) >= 0.01;
  const credits = valid ? Math.floor(Number(amount) * 100) : 0;
  const busy = step !== null;
  const estimate = valid ? tokenAmountEstimate(Number(amount), token, usdPriceFor(usdPrices, token)) : null;

  async function run(id: string, wallet: () => Promise<FundingWallet>) {
    setActive(id);
    setError(null);
    setNotice(null);
    setMessage(null);
    setStep("creating");
    try {
      const session = getValidToken() ?? (await signIn().catch(() => null));
      const result = await fundWithChainTransfer(portalFundingApi(session, token), await wallet(), {
        amountUsdc: amount,
        onStep: setStep,
      });
      if (result.status === "SETTLED") {
        toast.success(`${(result.credited ?? credits).toLocaleString()} credits added`);
        onCredited();
      } else {
        setMessage("Your transfer is on chain and will be credited shortly. You can close this.");
      }
    } catch (err) {
      // A short wallet is a step for the person to take, not a failure of ours, so it is not shown as an error.
      if (err instanceof InsufficientFundsError) setNotice(insufficientFundsCopy(err));
      else setError(friendlyErrorMessage(err, "Could not complete the top-up."));
    } finally {
      setStep(null);
      setActive(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h2 className="text-base font-bold">Add credits</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pay from your wallet. One credit is one cent. {balance !== undefined ? `You have ${balance.toLocaleString()} credits.` : ""}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="usdc" className="mb-1.5 block text-sm text-muted-foreground">Amount in dollars</label>
        <Input id="usdc" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Pay with">
        {TOKENS.map((symbol) => (
          <Button key={symbol} type="button" size="sm" variant={symbol === token ? "default" : "outline"} disabled={busy} onClick={() => setToken(symbol)}>
            {symbol}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {signer ? (
          <Button disabled={busy || !valid} onClick={() => run("media", async () => mediaWalletFundingWallet(signer))}>
            {busy && active === "media" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay with Media Wallet
          </Button>
        ) : null}
        {external.map((wallet) => (
          <Button key={wallet.id} variant="outline" disabled={busy || !valid} onClick={() => run(wallet.id, () => connectExternalWallet(wallet))}>
            {busy && active === wallet.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay with {wallet.name}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {step ? STEP_COPY[step] : credits > 0 ? `${credits.toLocaleString()} credits${estimate ? ` · about ${estimate} ${token}` : ""}` : "Enter an amount"}
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {notice ? (
        <div role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">{notice.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{notice.body}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
