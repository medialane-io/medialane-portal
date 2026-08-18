"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface TxLinkProps {
  txHash: string;
  explorerUrl: string;
  className?: string;
}

export function TxLink({ txHash, explorerUrl, className }: TxLinkProps) {
  return (
    <a
      href={`${explorerUrl}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <span className="tabular-nums">{txHash.slice(0, 10)}…{txHash.slice(-8)}</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

interface ProcessingStateProps {
  title: string;
  description?: string;
  txHash?: string | null;
  explorerUrl?: string;
}

export function ProcessingState({
  title,
  description = "Approve the wallet prompt and keep this window open.",
  txHash,
  explorerUrl,
}: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 py-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="text-center space-y-1">
        <p className="font-semibold">{title}</p>
        {txHash && explorerUrl ? <TxLink txHash={txHash} explorerUrl={explorerUrl} className="mt-1" /> : null}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface SuccessStateProps {
  title: string;
  description: ReactNode;
  txHash?: string | null;
  explorerUrl: string;
  onDone: () => void;
}

export function SuccessState({ title, description, txHash, explorerUrl, onDone }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 py-8">
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-brand-orange" />
      </div>
      <div className="text-center space-y-1 max-w-full">
        <p className="font-bold text-xl break-words">{title}</p>
        <p className="text-sm text-muted-foreground break-words">{description}</p>
      </div>
      {txHash && <TxLink txHash={txHash} explorerUrl={explorerUrl} />}
      <Button className="w-full h-11" onClick={onDone}>Done</Button>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description: ReactNode;
  error?: string | null;
  txHash?: string | null;
  explorerUrl: string;
  onRetry?: () => void;
  onDone: () => void;
}

export function ErrorState({ title, description, error, txHash, explorerUrl, onRetry, onDone }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 py-8">
      <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center">
        <AlertCircle className="h-9 w-9 text-destructive" />
      </div>
      <div className="text-center space-y-1 max-w-full">
        <p className="font-bold text-xl break-words">{title}</p>
        <p className="text-sm text-muted-foreground break-words">{description}</p>
      </div>
      {error ? (
        <div className="w-full flex items-start gap-2 rounded-lg bg-destructive/5 p-3 text-left text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}
      {txHash ? <TxLink txHash={txHash} explorerUrl={explorerUrl} /> : null}
      <div className="flex w-full gap-2">
        {onRetry ? (
          <Button variant="outline" className="flex-1 h-11" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        <Button className="flex-1 h-11" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
