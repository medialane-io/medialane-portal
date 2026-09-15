"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaunchpadRun } from "@/lib/launchpad/runs-client";
import { CatalogDrop } from "./catalog-section";

export function itemCount(run: LaunchpadRun | null): number {
  const items = (run?.spec as { items?: unknown[] } | undefined)?.items;
  return Array.isArray(items) ? items.length : 0;
}

export function RunInProgress({
  run,
  missing,
  busy,
  onFiles,
  onContinue,
  onCancel,
}: {
  run: LaunchpadRun;
  missing: string[];
  busy: boolean;
  onFiles: (files: FileList | null) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Your run is paid for</h2>
      <p className="text-sm text-muted-foreground">
        {itemCount(run).toLocaleString()} items. Continue anytime and it picks up where it stopped.
      </p>
      {missing.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm">Attach these files to continue: {missing.join(", ")}</p>
          <CatalogDrop onFiles={onFiles} disabled={busy} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onContinue} disabled={busy} size="lg">
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

export function RunClosed({ run, onStartOver }: { run: LaunchpadRun; onStartOver: () => void }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        {run.status === "COMPLETED"
          ? `${itemCount(run).toLocaleString()} items tokenized`
          : "This run was cancelled and what it did not use is back in your credits"}
      </h2>
      <Button onClick={onStartOver}>Start another run</Button>
    </section>
  );
}
