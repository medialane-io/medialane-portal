"use client";

import Link from "next/link";
import { ActionDialog } from "@medialane/ui";
import { Check, Coins, Loader2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { stepStates, type TaskPhase } from "@/src/lib/task-progress";

export function TaskDialog({
  open,
  title,
  labels,
  activeIndex,
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
  labels: readonly string[];
  activeIndex: number;
  phase: TaskPhase;
  detail?: string | null;
  error?: string | null;
  outOfCredits?: boolean;
  successLine?: string;
  onClose: () => void;
  onDone?: () => void;
}) {
  const steps = stepStates(labels, activeIndex, phase);
  const dismissable = phase !== "running";

  return (
    <ActionDialog open={open} onClose={dismissable ? onClose : () => {}}>
      <div className="rounded-2xl bg-background p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-semibold">{title}</p>
          {dismissable ? (
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {outOfCredits ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Coins className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">You are out of credits</p>
                <p className="text-sm text-muted-foreground">
                  Top up and this will go straight through.
                </p>
              </div>
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
        ) : (
          <>
            <ol className="space-y-3">
              {steps.map((step) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    className={
                      step.state === "done"
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : step.state === "active"
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"
                          : "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    }
                  >
                    {step.state === "done" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : step.state === "active" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                  </span>
                  <span
                    className={
                      step.state === "pending"
                        ? "text-sm text-muted-foreground"
                        : "text-sm font-medium"
                    }
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            {phase === "running" && detail ? (
              <p className="text-sm text-muted-foreground">{detail}</p>
            ) : null}

            {phase === "error" && error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            {phase === "success" && successLine ? (
              <p className="inline-flex items-center gap-2 text-sm text-primary">
                <Check className="h-4 w-4" />
                {successLine}
              </p>
            ) : null}

            {phase === "success" ? (
              <Button size="sm" onClick={onDone ?? onClose}>
                Done
              </Button>
            ) : null}

            {phase === "error" ? (
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            ) : null}
          </>
        )}
      </div>
    </ActionDialog>
  );
}
