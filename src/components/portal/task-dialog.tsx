"use client";

import Link from "next/link";
import { ActionDialog } from "@medialane/ui";
import { Check, Coins, Loader2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { type TaskPhase } from "@/src/lib/task-progress";

export function TaskDialog({
  open,
  title,
  phase,
  detail,
  error,
  outOfCredits,
  successLine,
  onClose,
  onDone,
}: {
  open: boolean;
  title: string;
  phase: TaskPhase;
  detail?: string | null;
  error?: string | null;
  outOfCredits?: boolean;
  successLine?: string;
  onClose: () => void;
  onDone?: () => void;
}) {
  const dismissable = phase !== "running";

  return (
    <ActionDialog open={open} onClose={dismissable ? onClose : () => {}}>
      <div className="rounded-2xl bg-background p-6 space-y-5">
        {dismissable ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {outOfCredits ? (
          <div className="space-y-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Coins className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold">You are out of credits</p>
              <p className="text-sm text-muted-foreground">
                Top up and this will go straight through.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/account/credits">Add credits</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Not now
              </Button>
            </div>
          </div>
        ) : phase === "running" ? (
          <div className="flex items-center gap-4">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
            <div className="min-w-0">
              <p className="font-semibold">{title}</p>
              {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
            </div>
          </div>
        ) : phase === "success" ? (
          <div className="space-y-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-5 w-5 text-primary" />
            </span>
            <p className="text-lg font-semibold">{successLine ?? "Done"}</p>
            <Button size="sm" onClick={onDone ?? onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg font-semibold">{title} did not finish</p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </ActionDialog>
  );
}
