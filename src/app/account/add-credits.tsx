"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { executeSponsored } from "@/lib/wallet/sponsored-executor";
import { creditTerms, atomicAmount, creditsFor, transferCall, type CreditTerms } from "@/lib/credits";
import { friendlyErrorMessage } from "@/lib/friendly-error";

type Step = "idle" | "sending" | "crediting";

const CHECKS = 8;
const GAP_MS = 4000;

export function AddCredits({ balance, onCredited }: {
  balance: number | undefined;
  onCredited: () => void;
}) {
  const { signer } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const [terms, setTerms] = useState<CreditTerms | null>(null);
  const [amount, setAmount] = useState("10");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    creditTerms().then(setTerms);
  }, []);

  const atomic = terms ? atomicAmount(amount, terms.decimals) : null;
  const credits = terms ? creditsFor(amount, terms.creditsPerUsdc) : 0;

  async function creditFrom(txHash: string) {
    setStep("crediting");
    const before = balance ?? 0;

    const token = getValidToken() ?? (await signIn().catch(() => null));

    for (let attempt = 0; attempt < CHECKS; attempt++) {
      await fetch("/api/proxy/v1/portal/credits/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ txHash }),
      }).catch(() => null);
      const me = await fetch("/api/proxy/v1/portal/me", {
        cache: "no-store",
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      })
        .then((r) => (r.ok ? (r.json() as Promise<{ data: { creditBalance: number } }>) : null))
        .then((b) => b?.data ?? null)
        .catch(() => null);

      if (me && me.creditBalance > before) {
        toast.success(`${(me.creditBalance - before).toLocaleString()} credits added`);
        onCredited();
        setStep("idle");
        return;
      }
      if (attempt < CHECKS - 1) await new Promise((r) => setTimeout(r, GAP_MS));
    }

    setError("The transfer is on chain and will be credited shortly. You can close this.");
    setStep("idle");
  }

  async function buy() {
    if (!signer || !terms || !atomic) return;
    setError(null);
    setStep("sending");
    try {
      const result = await executeSponsored(signer, [transferCall(terms, atomic)]);
      if (result.status !== "sponsored") {
        setError("That transfer could not be sent right now. Try again shortly.");
        setStep("idle");
        return;
      }
      await creditFrom(result.transactionHash);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Could not send that transfer."));
      setStep("idle");
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
            Pay in USDC from your wallet. There is no gas to cover.
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="usdc" className="mb-1.5 block text-sm text-muted-foreground">
            Amount in USDC
          </label>
          <Input
            id="usdc"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={step !== "idle"}
          />
        </div>
        <Button onClick={buy} disabled={step !== "idle" || !atomic || !signer || !terms}>
          {step === "idle" ? "Add credits" : <Loader2 className="h-4 w-4 animate-spin" />}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {credits > 0 ? `${credits.toLocaleString()} credits` : "Enter an amount"}
        {step === "sending" ? " · confirm in your wallet" : null}
        {step === "crediting" ? " · waiting for it to land" : null}
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
