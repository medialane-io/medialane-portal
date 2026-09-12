"use client";

import { useState } from "react";
import Link from "next/link";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { useMyUsernameClaim, submitUsernameClaim, checkUsernameAvailability } from "@/hooks/use-username-claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AtSign, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

type CheckState = "idle" | "checking" | "available" | "taken";

function UsernameInput({ value, onChange, onCheck, onSubmit, checkState, checkReason, loading, disabled }: {
  value: string; onChange: (v: string) => void;
  onCheck: () => void; onSubmit: () => void;
  checkState: CheckState; checkReason?: string;
  loading: boolean; disabled: boolean;
}) {
  const isAvailable = checkState === "available";
  const isChecking = checkState === "checking";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-7 tabular-nums"
            placeholder="yourname"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && !loading && !isChecking && (isAvailable ? onSubmit() : onCheck())}
          />
        </div>
        {isAvailable ? (
          <Button onClick={onSubmit} disabled={loading || disabled} className="bg-green-600 hover:bg-green-700">
            {loading ? "Submitting…" : `Claim @${value}`}
          </Button>
        ) : (
          <Button onClick={onCheck} disabled={isChecking || disabled || value.length < 3} variant="outline">
            {isChecking ? "Checking…" : "Check"}
          </Button>
        )}
      </div>
      {checkState === "taken" && (
        <p className="text-xs text-destructive">{checkReason ?? "That username is not available."}</p>
      )}
      {checkState === "available" && (
        <p className="text-xs text-green-500">@{value} is available!</p>
      )}
    </div>
  );
}

export function UsernameClaimPanel({ bare = false }: { bare?: boolean } = {}) {
  const shell = bare ? "space-y-3 max-w-lg" : "bento-cell p-5 space-y-3";
  const { address: walletAddress } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const { username: approvedUsername, claim, mutate: mutateClaim } = useMyUsernameClaim();
  const [claimInput, setClaimInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkReason, setCheckReason] = useState<string | undefined>();
  const [claimStatus, setClaimStatus] = useState<"idle" | "success" | "error">("idle");
  const [claimError, setClaimError] = useState<string | null>(null);

  async function handleCheck() {
    if (!claimInput.trim()) return;
    setCheckState("checking");
    setCheckReason(undefined);
    try {
      const result = await checkUsernameAvailability(claimInput);
      setCheckState(result.available ? "available" : "taken");
      if (!result.available) setCheckReason(result.reason);
    } catch {
      setCheckState("idle");
      setClaimError("Could not check username availability");
    }
  }

  async function handleClaim() {
    if (!claimInput.trim()) return;
    setClaiming(true);
    setClaimStatus("idle");
    setClaimError(null);
    try {
      const token = getValidToken() ?? (await signIn());
      if (!token) throw new Error("Not authenticated");
      const result = await submitUsernameClaim(claimInput.trim().toLowerCase(), token);
      if (result.error) {
        setClaimStatus("error");
        setClaimError(result.error);
      } else {
        setClaimStatus("success");
        setClaimInput("");
        setCheckState("idle");
        setCheckReason(undefined);
        await mutateClaim();
      }
    } catch {
      setClaimStatus("error");
      setClaimError("Failed to submit claim");
    } finally {
      setClaiming(false);
    }
  }

  if (approvedUsername) {
    return (
      <div className={shell}>
        {!bare && (
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-primary" />
            <p className="font-semibold">Username</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-muted-foreground">Your username:</span>
            <a href={`/creator/${approvedUsername}`} className="tabular-nums font-medium text-primary hover:underline">
              @{approvedUsername}
            </a>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/creator/${approvedUsername}`}>
              View profile <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (claim?.status === "PENDING") {
    return (
      <div className={shell}>
        {!bare && (
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-primary" />
            <p className="font-semibold">Username</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
          <span>
            Your claim for{" "}
            <span className="tabular-nums font-medium text-foreground">@{claim.username}</span> is pending DAO review.
          </span>
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10 ml-1">
            Pending
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      {!bare && (
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-primary" />
          <p className="font-semibold">Claim Your Username</p>
        </div>
      )}

      {claim?.status === "REJECTED" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>
            Your claim for <span className="tabular-nums">@{claim.username}</span> was rejected.
            {claim.adminNotes && <span className="ml-1 italic">&ldquo;{claim.adminNotes}&rdquo;</span>}
          </span>
        </div>
      )}

      {!bare && (
        <p className="text-sm text-muted-foreground">
          Get a shareable profile URL like{" "}
          <span className="tabular-nums text-foreground">medialane.io/creator/yourname</span>.
          Claims are reviewed by the Medialane DAO to prevent impersonation.
        </p>
      )}

      <UsernameInput
        value={claimInput}
        onChange={(v) => { setClaimInput(v); setCheckState("idle"); setCheckReason(undefined); setClaimStatus("idle"); setClaimError(null); }}
        onCheck={handleCheck}
        onSubmit={handleClaim}
        checkState={checkState}
        checkReason={checkReason}
        loading={claiming}
        disabled={!walletAddress}
      />
      {claimStatus === "success" && (
        <p className="text-sm text-emerald-500">✓ Claim submitted — the Medialane DAO team will review it shortly.</p>
      )}
      {claimStatus === "error" && claimError && (
        <p className="text-sm text-destructive">{claimError}</p>
      )}
    </div>
  );
}
