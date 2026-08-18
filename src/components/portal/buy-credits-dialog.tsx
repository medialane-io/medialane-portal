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
import { ProcessingState, SuccessState, ErrorState, TxLink } from "@/src/components/portal/credits-dialog-primitives";

const USDC_CONTRACT = "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";

type Step = "details" | "processing" | "confirming" | "success" | "error";

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  treasuryAddress: string;
  onCredited: () => void;
}

export function BuyCreditsDialog({ open, onOpenChange, address, treasuryAddress, onCredited }: BuyCreditsDialogProps) {
  const { account } = useAccount();
  const [step, setStep] = useState<Step>("details");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("details");
      setUsdcAmount("");
      setTxHash(null);
      setCreditedAmount(null);
      setErrorMessage(null);
      setConfirmError(null);
    }
  }, [open]);

  const parsedUsdc = parseFloat(usdcAmount);
  const previewCredits = !isNaN(parsedUsdc) && parsedUsdc > 0 ? Math.floor(parsedUsdc * CREDITS_PER_USDC) : null;

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
        setConfirmError(json.error ?? "Still waiting for your transfer to confirm on-chain — try again in a moment.");
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
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) return;

    setStep("processing");
    try {
      const amount = BigInt(Math.round(usdc * 1_000_000));
      const result = await account.execute([
        {
          contractAddress: USDC_CONTRACT,
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
            description="Nothing was submitted — your USDC is safe."
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">USDC on Starknet</Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="10"
                autoFocus
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                1 USDC = {CREDITS_PER_USDC} credits, credited automatically once your transfer confirms on-chain.
              </p>
              {previewCredits !== null && (
                <p className="text-xs text-muted-foreground">
                  You&apos;ll receive at least{" "}
                  <span className="text-primary font-semibold">{previewCredits.toLocaleString()} credits</span> (plus any
                  MDLN bonus, applied automatically).
                </p>
              )}
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
