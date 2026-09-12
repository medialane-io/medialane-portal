"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertCircle, CheckCircle, Flag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { normalizeAddress } from "@medialane/sdk";

export type ReportTarget =
  | { type: "TOKEN"; contract: string; tokenId: string; name?: string }
  | { type: "COLLECTION"; contract: string; name?: string }
  | { type: "CREATOR"; address: string; name?: string }
  | { type: "COMMENT"; commentId: string };

const CATEGORIES = [
  { value: "COPYRIGHT_PIRACY", label: "Copyright / Piracy" },
  { value: "VIOLENCE_GRAPHIC", label: "Violence / Graphic content" },
  { value: "HATE_SPEECH", label: "Hate speech" },
  { value: "SCAM_FRAUD", label: "Scam / Fraud" },
  { value: "SPAM", label: "Spam" },
  { value: "NSFW", label: "NSFW / Adult content" },
  { value: "OTHER", label: "Other" },
] as const;

interface ReportDialogProps {
  target: ReportTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ target, open, onOpenChange }: ReportDialogProps) {
  const { hasWallet } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [submitStep, setSubmitStep] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (next && !hasWallet) {
      router.push(`/connect?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!next && submitStep !== "submitting") {
      setCategories([]);
      setDescription("");
      setSubmitStep("idle");
      setSubmitError(null);
      onOpenChange(false);
    }
    if (next) onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (categories.length === 0 || submitStep === "submitting") return;
    setSubmitStep("submitting");
    setSubmitError(null);

    const normalizedContract =
      target.type === "TOKEN" || target.type === "COLLECTION"
        ? normalizeAddress("STARKNET", target.contract)
        : undefined;
    const normalizedAddress =
      target.type === "CREATOR" ? normalizeAddress("STARKNET", target.address) : undefined;

    let targetKey: string;
    if (target.type === "TOKEN") targetKey = `TOKEN:${normalizedContract}:${target.tokenId}`;
    else if (target.type === "COLLECTION") targetKey = `COLLECTION:${normalizedContract}`;
    else if (target.type === "CREATOR") targetKey = `CREATOR:${normalizedAddress}`;
    else targetKey = `COMMENT::${target.commentId}`;

    const payload: Record<string, unknown> = {
      targetType: target.type,
      targetKey,
      targetContract: normalizedContract,
      targetTokenId: target.type === "TOKEN" ? target.tokenId : undefined,
      targetAddress: normalizedAddress,
      targetId: target.type === "COMMENT" ? target.commentId : undefined,
      categories,
      description: description.trim() || undefined,
    };

    try {
      const token = getValidToken() ?? (await signIn());
      if (!token) {
        setSubmitStep("error");
        setSubmitError("Please secure your account to submit a report.");
        return;
      }
      const res = await fetch("/api/proxy/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setSubmitStep("error");
        setSubmitError("You've already reported this content.");
        return;
      }
      if (res.status === 429) {
        setSubmitStep("error");
        setSubmitError("Too many reports — please wait before trying again.");
        return;
      }
      if (!res.ok) throw new Error("Unexpected error");

      setSubmitStep("success");
    } catch {
      setSubmitStep("error");
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  const targetLabel =
    target.type !== "COMMENT" && target.name
      ? `"${target.name}"`
      : target.type.charAt(0) + target.type.slice(1).toLowerCase();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Report {targetLabel}
          </DialogTitle>
        </DialogHeader>

        {submitStep === "success" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
            <div className="space-y-1">
              <p className="font-semibold">Report submitted</p>
              <p className="text-sm text-muted-foreground">Our team will review it.</p>
            </div>
            <Button className="w-full" onClick={() => { setSubmitStep("idle"); onOpenChange(false); }}>Done</Button>
          </div>
        ) : submitStep === "error" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">{submitError}</p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => { setSubmitStep("idle"); setSubmitError(null); }}>Try again</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setSubmitStep("idle"); onOpenChange(false); }}>Dismiss</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  What&apos;s wrong with this content?{" "}
                  <span className="text-muted-foreground font-normal">
                    (select all that apply)
                  </span>
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORIES.map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={categories.includes(value)}
                        onCheckedChange={() => toggleCategory(value)}
                        disabled={submitStep === "submitting"}
                      />
                      <label
                        htmlFor={value}
                        className="text-sm cursor-pointer leading-none"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description" className="text-sm font-medium">
                  Additional details{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="report-description"
                  placeholder="Describe the issue in more detail (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="resize-none h-24"
                  disabled={submitStep === "submitting"}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/500
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Reports are reviewed by the Medialane DAO team. Content remains
                accessible onchain and via the permissionless dapp.
              </p>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitStep === "submitting"}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={categories.length === 0 || submitStep === "submitting"}
              >
                {submitStep === "submitting" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
