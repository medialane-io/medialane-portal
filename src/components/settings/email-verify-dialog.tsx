"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { friendlyErrorMessage } from "@/lib/friendly-error";

type Step = "sending" | "code" | "verifying" | "success" | "error";

const RESEND_COOLDOWN_S = 30;

interface EmailVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerified: (emailVerificationToken: string) => Promise<void> | void;
  skipInitialSend?: boolean;
}

export function EmailVerifyDialog({ open, onOpenChange, email, onVerified, skipInitialSend }: EmailVerifyDialogProps) {
  const [step, setStep] = useState<Step>("sending");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendCode = async () => {
    setStep("sending");
    setError(null);
    try {
      const res = await fetch("/api/proxy/v1/auth/email/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Couldn't send the code. Please try again.");
      setStep("code");
      setCooldown(RESEND_COOLDOWN_S);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't send the code. Please try again."));
      setStep("error");
    }
  };

  useEffect(() => {
    if (!open) return;
    setCode("");
    if (skipInitialSend) {
      setError(null);
      setStep("code");
      setCooldown(RESEND_COOLDOWN_S);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    void sendCode();
    
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async () => {
    setStep("verifying");
    setError(null);
    try {
      const res = await fetch("/api/proxy/v1/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Incorrect code. Please try again.");
      await onVerified((data as { token: string }).token);
      setStep("success");
      toast.success("Email verified");
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Incorrect code. Please try again."));
      setCode("");
      setStep("code");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => step !== "verifying" && onOpenChange(next)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {step === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : (
              <Mail className="h-6 w-6 text-primary" />
            )}
          </div>
          <DialogTitle>
            {step === "success" ? "Email verified" : "Verify your email"}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? `${email} is now confirmed on your account.`
              : `Enter the 6-digit code we sent to ${email}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "sending" && (
            <div className="flex w-full items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code…
            </div>
          )}

          {(step === "code" || step === "verifying") && (
            <>
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                disabled={step === "verifying"}
                className="w-full text-center text-lg tracking-[0.5em]"
              />
              <Button
                className="w-full gap-2"
                onClick={verify}
                disabled={step === "verifying" || code.length !== 6}
              >
                {step === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={sendCode}
                disabled={cooldown > 0 || step === "verifying"}
                className="text-xs text-muted-foreground"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </Button>
            </>
          )}

          {step === "error" && (
            <Button className="w-full" onClick={sendCode}>
              Try again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
