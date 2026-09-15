"use client";

import Link from "next/link";
import useSWR from "swr";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import type { RunStatus } from "@/lib/launchpad/runs-client";

const STATUS_LABEL: Record<RunStatus, string> = {
  DRAFT: "Draft",
  PAID: "Ready to run",
  RUNNING: "In progress",
  COMPLETED: "Done",
  FAILED: "Needs attention",
  CANCELLED: "Cancelled",
};

const SERVICE: Record<string, { label: string; href: string }> = {
  "data-tokenization-erc721": { label: "Data Tokenization", href: "/launchpad/data-tokenization" },
};

export function RunsList() {
  const { signedIn } = usePortalSession();
  const client = useRunsClient();
  const { data } = useSWR(signedIn ? "launchpad:runs" : null, () => client.list(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const runs = (data ?? []).filter((run) => SERVICE[run.service] && run.status !== "CANCELLED");
  if (runs.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Your runs</h2>
      <ul className="divide-y divide-border rounded-2xl bg-muted/40">
        {runs.map((run) => (
          <li key={run.id}>
            <Link
              href={`${SERVICE[run.service]!.href}?run=${run.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted"
            >
              <span className="font-medium">{SERVICE[run.service]!.label}</span>
              <span className="text-sm text-muted-foreground">
                {STATUS_LABEL[run.status]} · {new Date(run.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
