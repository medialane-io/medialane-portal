"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { fundWithChainTransfer, type FundingStep, type FundingWallet } from "@medialane/sdk/starknet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { MIN_TOP_UP_USDC } from "@/lib/funding/amount";
import { portalFundingApi } from "@/lib/funding/api";
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

const AMOUNT = /^\d{1,5}(\.\d{1,2})?$/;

export function AddCredits({ balance, onCredited }: { balance: number | undefined; onCredited: () => void }) {
  const { signer } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const [amount, setAmount] = useState("10");
  const [external, setExternal] = useState<ExternalWallet[]>([]);
  const [step, setStep] = useState<FundingStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExternalWallets().then(setExternal).catch(() => setExternal([]));
  }, []);

  const valid = AMOUNT.test(amount) && Number(amount) >= Number(MIN_TOP_UP_USDC) && Number(amount) <= 10_000;
  const credits = valid ? Math.floor(Number(amount) * 100) : 0;
  const busy = step !== null;

  async function run(wallet: () => Promise<FundingWallet>) {
    setError(null);
    setMessage(null);
    setStep("creating");
    try {
      const token = getValidToken() ?? (await signIn().catch(() => null));
      const result = await fundWithChainTransfer(portalFundingApi(token), await wallet(), {
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
      setError(friendlyErrorMessage(err, "Could not complete the top-up."));
    } finally {
      setStep(null);
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
            Pay in USDC from your wallet. {balance !== undefined ? `You have ${balance.toLocaleString()} credits. ` : ""}
            The minimum is {MIN_TOP_UP_USDC} USDC (100 credits).
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="usdc" className="mb-1.5 block text-sm text-muted-foreground">Amount in USDC</label>
        <Input id="usdc" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
      </div>

      <div className="flex flex-wrap gap-3">
        {signer ? (
          <Button disabled={busy || !valid} onClick={() => run(async () => mediaWalletFundingWallet(signer))}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay with Media Wallet
          </Button>
        ) : null}
        {external.map((wallet) => (
          <Button key={wallet.id} variant="outline" disabled={busy || !valid} onClick={() => run(() => connectExternalWallet(wallet))}>
            Pay with {wallet.name}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {step ? STEP_COPY[step] : credits > 0 ? `${credits.toLocaleString()} credits` : `Enter at least ${MIN_TOP_UP_USDC} USDC`}
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
