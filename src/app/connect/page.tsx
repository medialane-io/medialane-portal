"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { getMedialaneClient } from "@/lib/medialane-client";
import { ValuePropCarousel } from "@/components/connect/value-prop-carousel";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { adoptAccountWallet } from "@/lib/wallet/account-wallet";
import { safeRelativePath } from "@/lib/safe-redirect";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification-required";
import { useSiwsToken } from "@/hooks/use-siws-token";

type Step = "email" | "checking-email" | "registering" | "code" | "verifying-code" | "add-email";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectForm />
    </Suspense>
  );
}

function ConnectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRelativePath(searchParams.get("redirect_url"));
  const [step, setStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const accountExistedRef = useRef(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const { hasWallet } = useWalletNativeSession();
  const emailStatus = useEmailVerificationStatus();
  const { getValidToken, signIn } = useSiwsToken();
  const [mounted, setMounted] = useState(false);
  const [addEmailInput, setAddEmailInput] = useState("");
  const [addEmailStatus, setAddEmailStatus] = useState<"idle" | "saving" | "error">("idle");
  const [addEmailError, setAddEmailError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !hasWallet || emailStatus === null) return;
    if (emailStatus.email) {
      router.replace(redirectTo ?? "/");
      return;
    }
    setStep("add-email");
  }, [mounted, hasWallet, emailStatus, redirectTo, router]);

  const submitAddEmail = async () => {
    const value = addEmailInput.trim();
    if (!value) return;
    setAddEmailStatus("saving");
    setAddEmailError(null);
    try {
      const token = getValidToken() ?? (await signIn());
      if (!token) throw new Error("Not authenticated");
      await getMedialaneClient().api.changeMyEmail(value, token);
      toast.success("Email added to your account");
      router.replace(redirectTo ?? "/");
    } catch (err) {
      setAddEmailStatus("error");
      setAddEmailError(friendlyErrorMessage(err, "Couldn't save your email. Please try again."));
    }
  };

  useEffect(() => {
    if (resendCooldown === 0) return;
    const id = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const goToWalletOnboarding = () => {
    router.push(`/wallet-onboarding${redirectTo ? `?redirect_url=${encodeURIComponent(redirectTo)}` : ""}`);
  };

  const continueWithEmail = async () => {
    setError(null);
    setStep("checking-email");
    try {
      const exists = await getMedialaneClient().api.checkEmailExists(email);
      accountExistedRef.current = exists;
      if (exists) {
        await requestLoginCode();
      } else {
        await registerNewAccount();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("email");
    }
  };

  const registerNewAccount = async () => {
    setStep("registering");
    try {
      const res = await fetch("/api/proxy/v1/auth/email/register-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        accountExistedRef.current = true;
        await requestLoginCode();
        return;
      }
      if (!res.ok) throw new Error("register-account failed");
      goToWalletOnboarding();
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("email");
    }
  };

  const requestLoginCode = async () => {
    try {
      const res = await fetch("/api/proxy/v1/auth/email/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request-code failed");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("code");
    } catch {
      setError("Couldn't send the code. Please try again.");
      setStep("email");
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/v1/auth/email/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Couldn't resend the code. Please try again.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't resend the code. Please try again."));
    } finally {
      setResending(false);
    }
  };

  const verifyLoginCode = async (codeOverride?: string) => {
    const codeToVerify = codeOverride ?? code;
    setError(null);
    setStep("verifying-code");
    try {
      const res = await fetch("/api/proxy/v1/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Incorrect code");
      if (accountExistedRef.current) {
        const linked = await adoptAccountWallet();
        router.push(linked ? redirectTo || "/" : "/wallet-onboarding");
        return;
      }
      goToWalletOnboarding();
    } catch (err) {
      setError(friendlyErrorMessage(err, "Incorrect code. Please try again."));
      setStep("code");
    }
  };

  if (!mounted || (hasWallet && step !== "add-email")) {
    return null;
  }

  if (step === "add-email") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Add your email to continue</CardTitle>
              <CardDescription>
                Used for account notices and signing back in. You can verify it any time from Settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {addEmailError && (
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{addEmailError}</AlertDescription>
                </Alert>
              )}
              <Input
                type="email"
                placeholder="you@example.com"
                value={addEmailInput}
                onChange={(e) => setAddEmailInput(e.target.value)}
                disabled={addEmailStatus === "saving"}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addEmailInput) void submitAddEmail();
                }}
              />
              <div className="btn-border-animated w-full p-[1px] rounded-lg">
                <Button
                  className="w-full gap-2 bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
                  size="lg"
                  onClick={() => void submitAddEmail()}
                  disabled={addEmailStatus === "saving" || !addEmailInput}
                >
                  {addEmailStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "code" || step === "verifying-code") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>Enter the 6-digit code we sent to {email}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value.replace(/\D/g, ""))}
              onComplete={(value) => void verifyLoginCode(value)}
              disabled={step === "verifying-code"}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg font-semibold" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <div className="btn-border-animated w-full p-[1px] rounded-lg">
              <Button
                className="w-full gap-2 bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
                size="lg"
                onClick={() => void verifyLoginCode()}
                disabled={step === "verifying-code" || code.length !== 6}
              >
                {step === "verifying-code" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Didn&apos;t receive it? Check your spam, or{" "}
              {resendCooldown > 0 ? (
                <span>resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void resendCode()}
                  disabled={resending}
                  className="underline underline-offset-2 hover:text-foreground disabled:opacity-50"
                >
                  {resending ? "resending…" : "resend the code"}
                </button>
              )}
              .
              <br />
              Still stuck?{" "}
              <a href="mailto:dao@medialane.org" className="underline underline-offset-2 hover:text-foreground">
                dao@medialane.org
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Connect with your email</CardTitle>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === "checking-email" || step === "registering"}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && email) void continueWithEmail();
              }}
            />
            <div className="btn-border-animated w-full p-[1px] rounded-lg">
              <Button
                className="w-full gap-2 bg-transparent text-white rounded-[7px] hover:bg-transparent hover:brightness-110 active:scale-[0.98] transition-all"
                size="lg"
                onClick={continueWithEmail}
                disabled={step === "checking-email" || step === "registering" || !email}
              >
                {step === "checking-email" || step === "registering" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
        <ValuePropCarousel />
      </div>
    </div>
  );
}
