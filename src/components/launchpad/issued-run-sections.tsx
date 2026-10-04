"use client";

import { Loader2 } from "lucide-react";
import type { LaunchpadRun } from "@medialane/sdk";
import { Button } from "@/components/ui/button";
import { issuedSummary } from "@/lib/launchpad/task-progress";

export const recipientCount = (run: LaunchpadRun | null) => {
  const guests = (run?.spec as { guests?: unknown[] } | undefined)?.guests;
  return Array.isArray(guests) ? guests.length : 0;
};

export function PaidRunSection({
  run,
  unit,
  needsArtwork,
  busy,
  onContinue,
  onCancel,
  headingClassName = "font-semibold",
  buttonClassName,
}: {
  run: LaunchpadRun;
  unit: string;
  needsArtwork: boolean;
  busy: boolean;
  onContinue: () => void;
  onCancel: () => void;
  headingClassName?: string;
  buttonClassName?: string;
}) {
  const count = recipientCount(run);
  return (
    <section className="space-y-4">
      <h2 className={headingClassName}>Your run is paid for</h2>
      <p className="text-muted-foreground">
        {count.toLocaleString()} {count === 1 ? unit : `${unit}s`}. Continue anytime and it picks up where it stopped.
      </p>
      {needsArtwork ? <p>Attach the artwork again to continue: {(run.spec as { artwork?: { name: string } }).artwork?.name}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onContinue} disabled={busy} size="lg" className={buttonClassName}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel and refund what is left
        </Button>
      </div>
    </section>
  );
}

export function ClosedRunSection({
  run,
  noun,
  onStartOver,
  headingClassName = "font-semibold",
}: {
  run: LaunchpadRun;
  noun: string;
  onStartOver: () => void;
  headingClassName?: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className={headingClassName}>
        {run.status === "COMPLETED"
          ? issuedSummary(recipientCount(run), noun)
          : "This run was cancelled and what it did not use is back in your credits"}
      </h2>
      <Button onClick={onStartOver}>Start another run</Button>
    </section>
  );
}
