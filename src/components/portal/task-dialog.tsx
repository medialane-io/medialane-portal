"use client";

import Link from "next/link";
import { Check, Coins, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
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
  const running = phase === "running";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !running) onClose(); }}>
      <DialogContent className="sm:max-w-md" hideClose={running}>
        {outOfCredits ? (
          <>
            <DialogHeader>
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Coins className="h-5 w-5" />
              </span>
              <DialogTitle>You are out of credits</DialogTitle>
              <DialogDescription>Top up and this will go straight through.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/account/credits">Add credits</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Not now
              </Button>
            </div>
          </>
        ) : running ? (
          <div className="flex items-center gap-4 py-2">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
            <div className="min-w-0">
              <DialogTitle className="text-base">{title}</DialogTitle>
              {detail ? (
                <DialogDescription className="mt-0.5">{detail}</DialogDescription>
              ) : null}
            </div>
          </div>
        ) : phase === "success" ? (
          <>
            <DialogHeader>
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </span>
              <DialogTitle>{successLine ?? "Done"}</DialogTitle>
            </DialogHeader>
            <Button size="sm" className="w-fit" onClick={onDone ?? onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title} did not finish</DialogTitle>
              {error ? <DialogDescription>{error}</DialogDescription> : null}
            </DialogHeader>
            <Button size="sm" variant="outline" className="w-fit" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
