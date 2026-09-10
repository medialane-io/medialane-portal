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
  readTokenBalances,
  formatBalance,
  hasEnough,
  sortByHoldings,
  type Balances,
} from "@/src/lib/token-balances";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  address: string;
  treasuryAddress: string;
  balance?: number;
  onCredited: () => void;
}

export function AddCredits({ open = true, onOpenChange, address, treasuryAddress, balance, onCredited }: BuyCreditsDialogProps) {
  const { account } = useAccount();
  const [step, setStep] = useState<Step>("details");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);
  const [symbol, setSymbol] = useState("USDC");
  const [balances, setBalances] = useState<Balances>({});
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

  useEffect(() => {
    if (!open || !address) return;
    let live = true;
    readTokenBalances(address, `${window.location.origin}/api/rpc`).then((b) => {
      if (live) setBalances(b);
    });
    return () => { live = false; };
  }, [open, address]);

  const tokensByHoldings = sortByHoldings(balances);
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol) ?? SUPPORTED_TOKENS[0];
  const tokenBalance = balances[token.symbol];
  const enough = hasEnough(tokenBalance, usdcAmount, token.decimals);
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

  const dismiss = () => {
    if (onOpenChange) {
      onOpenChange(false);
      return;
    }
    setStep("details");
    setUsdcAmount("");
    setTxHash(null);
    setCreditedAmount(null);
    setErrorMessage(null);
  };

  return (
    <>
        {step === "success" ? (
          <SuccessState
            title={`+${(creditedAmount ?? 0).toLocaleString()} credits added`}
            description="Your balance is updated and ready to use."
            txHash={txHash}
            explorerUrl={EXPLORER_URL}
            onDone={dismiss}
          />
        ) : step === "error" ? (
          <ErrorState
            title="Deposit failed"
            description="Nothing was submitted. Your USDC is safe."
            error={errorMessage}
            explorerUrl={EXPLORER_URL}
            onRetry={() => setStep("details")}
            onDone={dismiss}
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
                    {tokensByHoldings.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.symbol}
                        {balances[t.symbol] !== undefined && balances[t.symbol] > 0n ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatBalance(balances[t.symbol], t.decimals, 3)}
                          </span>
                        ) : null}
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {token.symbol === "USDC" || token.symbol === "USDT"
                    ? CREDIT_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant={parsedUsdc === preset ? "default" : "outline"}
                          onClick={() => setUsdcAmount(String(preset))}
                        >
                          {preset}
                        </Button>
                      ))
                    : null}
                </div>
                {tokenBalance !== undefined ? (
                  <button
                    type="button"
                    onClick={() => setUsdcAmount(formatBalance(tokenBalance, token.decimals, 6))}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    You have {formatBalance(tokenBalance, token.decimals, 4)} {token.symbol} · Max
                  </button>
                ) : null}
              </div>
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

            </div>
            <Button
              className="w-full h-11"
              variant="gradient-fill"
              onClick={handleDeposit}
              disabled={!account || !usdcAmount || parsedUsdc <= 0 || !enough}
            >
              {!account
                ? "Connect your wallet"
                : !usdcAmount || parsedUsdc <= 0
                  ? "Enter an amount"
                  : !enough
                    ? `You have ${formatBalance(tokenBalance ?? 0n, token.decimals, 4)} ${token.symbol}`
                    : previewCredits !== null
                      ? `Deposit for ${previewCredits.toLocaleString()} credits`
                      : "Deposit"}
            </Button>
          </div>
        )}
    </>
  );
}

export function BuyCreditsDialog(props: BuyCreditsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl">
        <DialogTitle className="sr-only">Add credits</DialogTitle>
        <DialogDescription className="sr-only">
          Add API credits to your account.
        </DialogDescription>
        <AddCredits {...props} />
      </DialogContent>
    </Dialog>
  );
}
