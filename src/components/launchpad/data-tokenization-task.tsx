"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceFormShell, ClaimRail } from "@medialane/ui";
import { ArrowLeft, Database, FileCheck2, Layers, Loader2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import { useRunExecution } from "@/hooks/use-run-execution";
import { useGroupChoice } from "@/hooks/use-group-choice";
import { CheckoutPanel } from "@/components/launchpad/checkout-panel";
import type { CollectionOption } from "./collection-picker";
import { GroupSection } from "./group-section";
import { TaskDialog } from "./task-dialog";
import { CatalogSection } from "./data-tokenization/catalog-section";
import { TermsSection } from "./data-tokenization/terms-section";
import { RunClosed, RunInProgress, itemCount } from "./data-tokenization/run-section";
import { LAUNCHPAD } from "@/lib/launchpad/services";
import { readManifest } from "@/lib/launchpad/data-tokenization/manifest";
import { defaultTerms, runSpec, type CollectionChoice, type Terms } from "@/lib/launchpad/data-tokenization/spec";
import type { LaunchpadRun } from "@medialane/sdk";
import { executeRun, describeRunEvent } from "@/lib/launchpad/data-tokenization/executor";

export function DataTokenizationTask() {
  const router = useRouter();
  const pathname = usePathname();
  const runParam = useSearchParams().get("run");
  const { address, signer, hasWallet } = useWalletNativeSession();
  const { account, refresh } = usePortalSession();
  const client = useRunsClient();

  const groupState = useGroupChoice<CollectionChoice, CollectionOption>((c) =>
    c.collectionId ? { kind: "existing", collectionId: c.collectionId, contractAddress: c.contractAddress } : null,
  );
  const [terms, setTerms] = useState<Terms>(defaultTerms);
  const [csv, setCsv] = useState<{ name: string; text: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [run, setRun] = useState<LaunchpadRun | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const { phase, detail, error, busy, execute: runWith, save: saveWith, fail, clearError, close } = useRunExecution({
    client,
    signer,
    address,
    describe: describeRunEvent,
    onRun: setRun,
    onNeedsFiles: setMissing,
    onSuccess: () => void refresh(),
  });

  useEffect(() => {
    if (!runParam || run?.id === runParam) return;
    client
      .get(runParam)
      .then(setRun)
      .catch((e) => fail(e instanceof Error ? e.message : "Could not open this run.", "idle"));
  }, [runParam, run?.id, client, fail]);

  const manifest = useMemo(() => (csv ? readManifest(csv.text, files) : null), [csv, files]);

  const collection = groupState.choice;

  const canSave = Boolean(collection && manifest && manifest.items.length > 0 && manifest.problems.length === 0);

  async function attach(list: FileList | null) {
    if (!list) return;
    const incoming = [...list];
    const catalog = incoming.find((f) => f.name.toLowerCase().endsWith(".csv"));
    if (catalog) setCsv({ name: catalog.name, text: await catalog.text() });
    const media = incoming.filter((f) => f !== catalog);
    if (media.length > 0) {
      setFiles((current) => [...current.filter((f) => !media.some((m) => m.name === f.name)), ...media]);
      setMissing((current) => current.filter((name) => !media.some((m) => m.name === name)));
    }
  }

  const save = () =>
    collection && manifest
      ? saveWith(async () => {
          const spec = runSpec(collection, terms, manifest.items);
          const saved =
            run?.status === "DRAFT" ? await client.update(run.id, spec) : await client.create(LAUNCHPAD.dataTokenization.run, spec);
          router.replace(`${pathname}?run=${saved.id}`);
          return saved;
        })
      : undefined;

  function execute(target: LaunchpadRun) {
    setMissing([]);
    return runWith(target, ({ deps, emit }) =>
      executeRun(
        target.id,
        {
          ...deps,
          client,
          files: new Map(files.map((f) => [f.name, f])),
          userAddress: address!,
          batchBase: client.runBatchBase,
          collectionBase: client.runCollectionBase,
        },
        emit,
      ),
    );
  }

  async function cancel() {
    if (!run) return;
    try {
      setRun(await client.cancel(run.id));
      refresh();
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not cancel this run.", "idle");
    }
  }

  function startOver() {
    setRun(null);
    setCsv(null);
    setFiles([]);
    setMissing([]);
    clearError();
    router.replace(pathname);
  }

  if (!hasWallet) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Data Tokenization</h1>
        <p className="mt-3 text-sm text-muted-foreground">Sign in to tokenize your catalog.</p>
        <Button asChild className="mt-5">
          <Link href="/connect">Sign in</Link>
        </Button>
      </main>
    );
  }

  const status = run?.status ?? "DRAFT";

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Tokenizing your catalog"
        phase={phase}
        detail={detail}
        error={error}
        successLine={`${itemCount(run).toLocaleString()} items tokenized`}
        onClose={close}
      />
      <ServiceFormShell
        icon={<Database className="h-4 w-4 text-white" />}
        title="Data Tokenization"
        subtitle="Tokenize a whole catalog into your own collection, with licensing terms that travel with every item."
        backSlot={
          <Link
            href="/launchpad"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Launchpad
          </Link>
        }
        aside={
          <ClaimRail
            included={[
              { icon: FileCheck2, title: "Proof of ownership", desc: "Authorship and date are recorded permanently for every item." },
              { icon: Scale, title: "Terms that travel", desc: "Licensing is carried by each item wherever it goes." },
              { icon: Layers, title: "Your whole catalog", desc: "Up to 500 items in one run, picked up anytime." },
            ]}
            steps={["Choose a collection", "Add your catalog and its files", "Pay once and run it"]}
            trustIcon={ShieldCheck}
            trustLead="You stay in control."
            trust="Every item is minted to your own wallet, and you approve each batch."
          />
        }
      >
        <div className="space-y-8">
          {status === "DRAFT" ? (
            <>
              <GroupSection
                words={{
                  existing: "One of my collections",
                  fresh: "A new collection",
                  nameLabel: "Collection name",
                  namePlaceholder: "Research archive",
                  symbolPlaceholder: "ARCH",
                }}
                group={groupState}
                serviceId={LAUNCHPAD.dataTokenization.collections}
                owner={address ?? ""}
                disabled={busy}
              />

              <CatalogSection
                manifest={manifest}
                csvName={csv?.name ?? null}
                fileCount={files.length}
                onFiles={attach}
                disabled={busy}
              />

              <TermsSection terms={terms} onChange={setTerms} disabled={busy} />

              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={busy || !canSave} size="lg">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {run ? "Save changes" : "Save and review"}
                </Button>
              </div>

              {run?.status === "DRAFT" && run.quote ? (
                <CheckoutPanel
                  run={run}
                  quote={run.quote}
                  balance={account?.creditBalance}
                  signer={signer}
                  client={client}
                  onPaid={(paid) => {
                    refresh();
                    void execute(paid);
                  }}
                />
              ) : null}
            </>
          ) : null}

          {run && (status === "PAID" || status === "RUNNING") ? (
            <RunInProgress
              run={run}
              missing={missing}
              busy={busy}
              onFiles={attach}
              onContinue={() => execute(run)}
              onCancel={cancel}
            />
          ) : null}

          {run && (status === "COMPLETED" || status === "CANCELLED") ? <RunClosed run={run} onStartOver={startOver} /> : null}

          {error && phase === "idle" ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </ServiceFormShell>
    </>
  );
}
