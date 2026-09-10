"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { toast } from "sonner";
import { Coins, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getFriendlyWalletError } from "@/src/lib/wallet-error";
import { CREDITS_PER_USDC, EXPLORER_URL } from "@/src/lib/constants";
import { CREDIT_PRESETS, creditsFor } from "@/src/lib/issuance-form";
import useSWR from "swr";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { SUPPORTED_TOKENS } from "@medialane/sdk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ProcessingState, SuccessState, ErrorState, TxLink } from "@/src/components/portal/credits-dialog-primitives";


type Step = "details" | "processing" | "confirming" | "success" | "error";

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  treasuryAddress: string;
  balance?: number;
  onCredited: () => void;
}

export function BuyCreditsDialog({ open, onOpenChange, address, treasuryAddress, balance, onCredited }: BuyCreditsDialogProps) {
  const { account } = useAccount();
  const [step, setStep] = useState<Step>("details");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);
  const [symbol, setSymbol] = useState("USDC");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("details");
      setSymbol("USDC");
      setUsdcAmount("");
      setTxHash(null);
      setCreditedAmount(null);
      setErrorMessage(null);
      setConfirmError(null);
    }
  }, [open]);

  const { data: pricesData } = useSWR<{ data?: { usd?: Record<string, number> } }>(
    open ? "/api/portal/prices" : null,
    portalFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const usd = pricesData?.data?.usd;

  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol) ?? SUPPORTED_TOKENS[0];
  const unitPrice = usd?.[token.symbol];

  const parsedUsdc = parseFloat(usdcAmount);
  const dollars = unitPrice !== undefined && !isNaN(parsedUsdc) ? parsedUsdc * unitPrice : NaN;
  const previewCredits = creditsFor(dollars, CREDITS_PER_USDC);

  async function confirmCredit(hash: string) {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch(`/api/portal/credits/fund?address=${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { credited: number }; error?: string };
      if (!res.ok) {
        setConfirmError(json.error ?? "Still waiting for your transfer to confirm on-chain. Try again in a moment.");
        return;
      }
      setCreditedAmount(json.data?.credited ?? 0);
      setStep("success");
      onCredited();
    } finally {
      setConfirming(false);
    }
  }

  async function handleDeposit() {
    if (!account || !treasuryAddress) return;
    const entered = parseFloat(usdcAmount);
    if (isNaN(entered) || entered <= 0) return;

    setStep("processing");
    try {
      const amount = BigInt(Math.round(entered * 10 ** token.decimals));
      const result = await account.execute([
        {
          contractAddress: token.address,
          entrypoint: "transfer",
          calldata: [treasuryAddress, amount.toString(), "0"],
        },
      ]);
      const hash = result.transaction_hash;
      setTxHash(hash);
      setStep("confirming");
      await confirmCredit(hash);
    } catch (err) {
      const friendly = getFriendlyWalletError(err);
      if (friendly.isUserRejection) {
        toast.info(friendly.title, { description: friendly.description });
        setStep("details");
      } else {
        setErrorMessage(friendly.message);
        setStep("error");
      }
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (step === "processing") return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl">
        <DialogTitle className="sr-only">Add credits</DialogTitle>
        <DialogDescription className="sr-only">
          Deposit USDC on Starknet to add API credits to your account.
        </DialogDescription>

        {step === "success" ? (
          <SuccessState
            title={`+${(creditedAmount ?? 0).toLocaleString()} credits added`}
            description="Your balance is updated and ready to use."
            txHash={txHash}
            explorerUrl={EXPLORER_URL}
            onDone={() => onOpenChange(false)}
          />
        ) : step === "error" ? (
          <ErrorState
            title="Deposit failed"
            description="Nothing was submitted. Your USDC is safe."
            error={errorMessage}
            explorerUrl={EXPLORER_URL}
            onRetry={() => setStep("details")}
            onDone={() => onOpenChange(false)}
          />
        ) : step === "processing" ? (
          <ProcessingState
            title="Confirming in your wallet…"
            description="Approve the transfer prompt and keep this window open."
          />
        ) : step === "confirming" ? (
          <div className="flex flex-col items-center gap-5 p-6 py-8">
            <RefreshCw className={`h-10 w-10 text-primary ${confirming ? "animate-spin" : ""}`} />
            <div className="text-center space-y-1">
              <p className="font-semibold">Crediting your account…</p>
              <p className="text-sm text-muted-foreground">
                Your transfer is on-chain. This usually only takes a few seconds.
              </p>
              {txHash && <TxLink txHash={txHash} explorerUrl={EXPLORER_URL} className="mt-1" />}
            </div>
            {confirmError && (
              <div className="w-full space-y-3">
                <p className="text-sm text-muted-foreground text-center">{confirmError}</p>
                <Button className="w-full h-11" onClick={() => txHash && confirmCredit(txHash)} disabled={confirming}>
                  {confirming ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Try confirming again"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <p className="font-semibold">Add credits</p>
            </div>
            {balance !== undefined && (
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Balance now</p>
                <p className="text-2xl font-bold tabular-nums">
                  {balance.toLocaleString()}
                  <span className="ml-1.5 text-sm font-medium text-muted-foreground">credits</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Pay with</Label>
              <div className="flex gap-2">
                <Select value={symbol} onValueChange={(v) => { setSymbol(v); setUsdcAmount(""); }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10"
                  autoFocus
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                />
              </div>
              {token.symbol === "USDC" || token.symbol === "USDT" ? (
                <div className="flex gap-2">
                  {CREDIT_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant={parsedUsdc === preset ? "default" : "outline"}
                      onClick={() => setUsdcAmount(String(preset))}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              ) : null}
              {previewCredits !== null ? (
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">You receive</p>
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {previewCredits.toLocaleString()}
                    <span className="ml-1.5 text-sm font-medium text-muted-foreground">credits</span>
                  </p>
                  {balance !== undefined && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Taking you to {(balance + previewCredits).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {unitPrice !== undefined
                    ? `1 ${token.symbol} is about $${unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}, and $1 buys ${CREDITS_PER_USDC} credits.`
                    : `$1 buys ${CREDITS_PER_USDC} credits.`}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Credits pay for issuing, wallet deployment and storage. Reading your own data is free.
                You are credited for what your transfer is worth when it confirms on-chain, and any
                MDLN bonus is applied then.
              </p>
            </div>
            <Button
              className="w-full h-11"
              variant="gradient-fill"
              onClick={handleDeposit}
              disabled={!account || !usdcAmount || parsedUsdc <= 0}
            >
              Deposit
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
