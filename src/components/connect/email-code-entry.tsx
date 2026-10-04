"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { canResendCode, canVerifyCode } from "@medialane/ui";
import type { EmailCode } from "@/hooks/use-email-code";

interface EmailCodeEntryProps {
  emailCode: EmailCode;
  onVerify: (code?: string) => void;
}

export function EmailCodeEntry({ emailCode, onVerify }: EmailCodeEntryProps) {
  const { state, setCode, send } = emailCode;
  const verifying = state.status === "verifying";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {state.error ? (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "sending" ? (
        <div className="flex items-center gap-2 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending code…
        </div>
      ) : (
        <>
          <InputOTP
            maxLength={6}
            value={state.code}
            onChange={setCode}
            onComplete={(value) => onVerify(value)}
            disabled={verifying}
            autoFocus
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg font-semibold" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button size="lg" className="w-full gap-2" onClick={() => onVerify()} disabled={!canVerifyCode(state)}>
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Didn&apos;t receive it? Check your spam, or{" "}
            {state.cooldown > 0 ? (
              <span>resend in {state.cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => void send()}
                disabled={!canResendCode(state)}
                className="underline underline-offset-2 hover:text-foreground disabled:opacity-50"
              >
                resend the code
              </button>
            )}
            .
          </p>
        </>
      )}
    </div>
  );
}
