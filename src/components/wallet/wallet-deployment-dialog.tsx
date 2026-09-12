"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { completeWalletDeployment, type DeploymentStep, type CompleteWalletDeploymentResult } from "@/lib/wallet/complete-deployment";

const STEP_LABEL: Record<DeploymentStep, string> = {
  "creating-passkey": "Creating passkey…",
  deploying: "Setting up your wallet…",
  "signing-in": "Signing in…",
};

interface WalletDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: CompleteWalletDeploymentResult) => void | Promise<void>;
}

export function WalletDeploymentDialog({ open, onOpenChange, onComplete }: WalletDeploymentDialogProps) {
  const [step, setStep] = useState<DeploymentStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    try {
      const result = await completeWalletDeployment(setStep);
      await onComplete(result);
      onOpenChange(false);
    } catch {
      setError("Something went wrong finishing your wallet setup. Please try again.");
    } finally {
      setStep(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !step && onOpenChange(next)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Finish setting up your wallet</DialogTitle>
          <DialogDescription>
            Your wallet hasn&apos;t finished deploying on Starknet yet. This picks up right where it left off.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {step ? (
            <div className="flex w-full items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {STEP_LABEL[step]}
            </div>
          ) : (
            <div className="btn-border-animated w-full p-[1px] rounded-lg">
              <Button
                className="w-full gap-2 bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
                size="lg"
                onClick={run}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
