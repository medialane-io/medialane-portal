"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { getMedialaneClient } from "@/lib/medialane-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { saveAccountEmail } from "@/lib/wallet/account-wallet";

const RESEND_COOLDOWN_S = 30;

type Step = "loading" | "add-email" | "sending" | "code" | "verifying" | "verified";

export default function VerifyEmailContent() {
  const router = useRouter();
  const { hasWallet, address: walletAddress } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();

  const [step, setStep] = useState<Step>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!walletAddress) return;
    (async () => {
      const token = getValidToken() ?? (await signIn());
      if (!token) return;
      const result = await getMedialaneClient().api.getMyWallet(token);
      if (result?.email && result.emailVerified) {
        setEmail(result.email);
        setStep("verified");
      } else if (result?.email) {
        setEmail(result.email);
        void sendCode(result.email);
      } else {
        setStep("add-email");
      }
    })();
    
  }, [walletAddress]);

  async function sendCode(forEmail: string) {
    setStep("sending");
    setError(null);
    try {
      const res = await fetch("/api/proxy/v1/auth/email/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forEmail }),
      });
      if (!res.ok) throw new Error("Couldn't send the code. Please try again.");
      setStep("code");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't send the code. Please try again."));
      setStep("code");
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleAddEmail() {
    const value = emailInput.trim();
    if (!value) return;
    setError(null);
    try {
      const token = getValidToken() ?? (await signIn());
      if (!token) throw new Error("Not authenticated");
      const result = await getMedialaneClient().api.changeMyEmail(value, token);
      saveAccountEmail(value);
      setEmail(result.email);
      void sendCode(result.email);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Failed to save email"));
    }
  }

  async function handleVerify(codeOverride?: string) {
    const codeToVerify = codeOverride ?? code;
    if (!email || codeToVerify.length !== 6) return;
    setStep("verifying");
    setError(null);
    try {
      const res = await fetch("/api/proxy/v1/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Incorrect code. Please try again.");
      const token = getValidToken() ?? (await signIn());
      if (!token) throw new Error("Not authenticated");
      await getMedialaneClient().api.upsertMyWallet(token, { emailVerificationToken: (data as { token: string }).token });
      setStep("verified");
      toast.success("Email verified");
    } catch (err) {
      setError(friendlyErrorMessage(err, "Incorrect code. Please try again."));
      setCode("");
      setStep("code");
    }
  }

  if (!hasWallet || step === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {hasWallet && step === "loading" ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Mail className="h-6 w-6 text-primary" />
                )}
              </div>
            </div>
            <CardTitle>{hasWallet ? "Loading…" : "Sign in first"}</CardTitle>
            {!hasWallet && <CardDescription>You need an account before you can verify an email.</CardDescription>}
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (step === "verified") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <CardTitle>Email verified</CardTitle>
            <CardDescription>{email} is confirmed on your account. You can list assets for sale and claim a username.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="btn-border-animated w-full rounded-lg p-[1px]">
              <Button
                className="w-full rounded-[7px] bg-transparent text-white transition-all hover:bg-transparent hover:brightness-110 active:scale-[0.98]"
                size="lg"
                onClick={() => router.back()}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "add-email") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Add your email</CardTitle>
            <CardDescription>We&apos;ll send a 6-digit code to confirm it&apos;s yours.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && emailInput.trim() && void handleAddEmail()}
              autoFocus
              className="w-full"
            />
            <div className="btn-border-animated w-full rounded-lg p-[1px]">
              <Button
                className="w-full rounded-[7px] bg-transparent text-white transition-all hover:bg-transparent hover:brightness-110 active:scale-[0.98]"
                size="lg"
                onClick={handleAddEmail}
                disabled={!emailInput.trim()}
              >
                Send code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {step === "sending" ? `Sending a code to ${email}…` : `Enter the 6-digit code we sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {step === "sending" ? (
            <div className="flex items-center gap-2 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code…
            </div>
          ) : (
            <>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value.replace(/\D/g, ""))}
                onComplete={(value) => void handleVerify(value)}
                disabled={step === "verifying"}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg font-semibold" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="btn-border-animated w-full rounded-lg p-[1px]">
                <Button
                  className="w-full gap-2 rounded-[7px] bg-transparent text-white transition-all hover:bg-transparent hover:brightness-110 active:scale-[0.98]"
                  size="lg"
                  onClick={() => void handleVerify()}
                  disabled={step === "verifying" || code.length !== 6}
                >
                  {step === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify
                </Button>
              </div>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Didn&apos;t receive it? Check your spam, or{" "}
                {cooldown > 0 ? (
                  <span>resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => email && void sendCode(email)}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    resend the code
                  </button>
                )}
                .
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
