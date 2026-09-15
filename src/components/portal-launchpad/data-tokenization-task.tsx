"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceFormShell, ClaimRail } from "@medialane/ui";
import { executeSponsored, type TypedDataSigner } from "@medialane/sdk/starknet";
import { ArrowLeft, Database, FileCheck2, Layers, Loader2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import { CheckoutPanel } from "@/components/launchpad/checkout-panel";
import { Field } from "@/components/launchpad/form-fields";
import { CollectionPicker } from "./collection-picker";
import { TaskDialog } from "./task-dialog";
import { CatalogSection } from "./data-tokenization/catalog-section";
import { TermsSection } from "./data-tokenization/terms-section";
import { RunClosed, RunInProgress, itemCount } from "./data-tokenization/run-section";
import { DATA_TOKENIZATION_SERVICE } from "@/lib/portal-launchpad/collection-copy";
import { type TaskPhase } from "@/lib/portal-launchpad/task-progress";
import { readManifest } from "@/lib/data-tokenization/manifest";
import { defaultTerms, runSpec, type CollectionChoice, type Terms } from "@/lib/data-tokenization/spec";
import { runBatchBase, runCollectionBase, type LaunchpadRun } from "@/lib/launchpad/runs-client";
import { executeRun, MissingFilesError, putFileToSignedUrl, type RunEvent } from "@/lib/launchpad/run-executor";

function describe(event: RunEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new collection in your wallet";
    case "upload":
      return `Uploading ${event.name} (${event.done + 1} of ${event.total})`;
    case "metadata":
      return `Recording details (${event.done + 1} of ${event.total})`;
    case "batch":
      return `Confirm batch ${event.index + 1} in your wallet`;
    case "confirming":
      return "Waiting for confirmation";
    case "done":
      return "Done";
  }
}

export function DataTokenizationTask() {
  const router = useRouter();
  const pathname = usePathname();
  const runParam = useSearchParams().get("run");
  const { address, signer, hasWallet } = useWalletNativeSession();
  const { account, refresh } = usePortalSession();
  const client = useRunsClient();

  const [collectionMode, setCollectionMode] = useState<"existing" | "new">("existing");
  const [existing, setExisting] = useState<Extract<CollectionChoice, { kind: "existing" }> | null>(null);
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [terms, setTerms] = useState<Terms>(defaultTerms);
  const [csv, setCsv] = useState<{ name: string; text: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [run, setRun] = useState<LaunchpadRun | null>(null);
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [detail, setDetail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    if (!runParam || run?.id === runParam) return;
    client
      .get(runParam)
      .then(setRun)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not open this run."));
  }, [runParam, run?.id, client]);

  const manifest = useMemo(() => (csv ? readManifest(csv.text, files) : null), [csv, files]);

  const collection: CollectionChoice | null =
    collectionMode === "new"
      ? newName.trim() && newSymbol.trim()
        ? { kind: "new", name: newName.trim(), symbol: newSymbol.trim().toUpperCase() }
        : null
      : existing;

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

  async function save() {
    if (!collection || !manifest) return;
    setPhase("running");
    setDetail("Saving your run");
    setError(null);
    try {
      const spec = runSpec(collection, terms, manifest.items);
      const saved =
        run?.status === "DRAFT" ? await client.update(run.id, spec) : await client.create(DATA_TOKENIZATION_SERVICE, spec);
      setRun(saved);
      router.replace(`${pathname}?run=${saved.id}`);
      setPhase("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this run.");
      setPhase("error");
    } finally {
      setDetail(null);
    }
  }

  async function execute(target: LaunchpadRun) {
    if (!signer || !address) return;
    setRun(target);
    setMissing([]);
    setError(null);
    setPhase("running");
    try {
      const finished = await executeRun(
        target.id,
        {
          client,
          files: new Map(files.map((f) => [f.name, f])),
          userAddress: address,
          batchBase: runBatchBase,
          collectionBase: runCollectionBase,
          putFile: (url, file) => putFileToSignedUrl(url, file),
          wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          sponsored: async (base) => {
            const result = await executeSponsored(
              { proxyUrl: base, fetchImpl: client.authorizedFetch },
              signer as unknown as TypedDataSigner,
              [],
            );
            if (result.status !== "sponsored") throw new Error(result.reason);
            return result.transactionHash;
          },
        },
        (event) => setDetail(describe(event)),
      );
      setRun(finished);
      setPhase("success");
      refresh();
    } catch (e) {
      if (e instanceof MissingFilesError) {
        setMissing(e.files);
        setPhase("idle");
        return;
      }
      setError(e instanceof Error ? e.message : "The run stopped. Continue to pick up where it left off.");
      setPhase("error");
      setRun(await client.get(target.id).catch(() => target));
    } finally {
      setDetail(null);
    }
  }

  async function cancel() {
    if (!run) return;
    try {
      setRun(await client.cancel(run.id));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel this run.");
    }
  }

  function startOver() {
    setRun(null);
    setCsv(null);
    setFiles([]);
    setMissing([]);
    setError(null);
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
  const busy = phase === "running";

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Tokenizing your catalog"
        phase={phase}
        detail={detail}
        error={error}
        successLine={`${itemCount(run).toLocaleString()} items tokenized`}
        onClose={() => setPhase("idle")}
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
              <section className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={collectionMode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCollectionMode("existing")}
                    disabled={busy}
                  >
                    One of my collections
                  </Button>
                  <Button
                    variant={collectionMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCollectionMode("new")}
                    disabled={busy}
                  >
                    A new collection
                  </Button>
                </div>

                {collectionMode === "existing" ? (
                  <CollectionPicker
                    serviceId={DATA_TOKENIZATION_SERVICE}
                    owner={address ?? ""}
                    signer={signer}
                    allowCreate={false}
                    value={existing?.contractAddress ?? ""}
                    onChange={(c) =>
                      c.collectionId
                        ? setExisting({ kind: "existing", collectionId: c.collectionId, contractAddress: c.contractAddress })
                        : null
                    }
                    disabled={busy}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Collection name">
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Research archive" disabled={busy} />
                    </Field>
                    <Field label="Short code">
                      <Input value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} placeholder="ARCH" disabled={busy} />
                    </Field>
                  </div>
                )}
              </section>

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

          {error && phase !== "error" ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </ServiceFormShell>
    </>
  );
}
