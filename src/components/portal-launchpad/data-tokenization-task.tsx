"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceFormShell, ClaimRail, CollapsibleSection, Label } from "@medialane/ui";
import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { executeSponsored, type TypedDataSigner } from "@medialane/sdk/starknet";
import { ArrowLeft, Database, Download, FileCheck2, Layers, Loader2, Scale, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import { CollectionPicker } from "./collection-picker";
import { TaskDialog } from "./task-dialog";
import { CheckoutPanel } from "@/components/launchpad/checkout-panel";
import { DATA_TOKENIZATION_SERVICE } from "@/lib/portal-launchpad/collection-copy";
import { type TaskPhase } from "@/lib/portal-launchpad/task-progress";
import { readManifest } from "@/lib/data-tokenization/manifest";
import { defaultTerms, runSpec, withPreset, type CollectionChoice, type Terms } from "@/lib/data-tokenization/spec";
import { runBatchBase, runCollectionBase, type LaunchpadRun } from "@/lib/launchpad/runs-client";
import { executeRun, MissingFilesError, putFileToSignedUrl, type RunEvent } from "@/lib/launchpad/run-executor";

const TEMPLATE = [
  "name,description,ip_type,file,image,Author",
  '"Quarterly report","Findings for the third quarter",Documents,report.pdf,cover.png,Ana',
  '"Street study",,Photography,street.jpg,,Rui',
].join("\n");

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

function specItemCount(run: LaunchpadRun | null): number {
  const items = (run?.spec as { items?: unknown[] } | undefined)?.items;
  return Array.isArray(items) ? items.length : 0;
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
  const [termsOpen, setTermsOpen] = useState(false);
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

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalog.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function save() {
    if (!collection || !manifest) return;
    setPhase("running");
    setDetail("Saving your run");
    setError(null);
    try {
      const spec = runSpec(collection, terms, manifest.items);
      const saved =
        run?.status === "DRAFT"
          ? await client.update(run.id, spec)
          : await client.create(DATA_TOKENIZATION_SERVICE, spec);
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
  const building = status === "DRAFT";
  const executing = status === "PAID" || status === "RUNNING";
  const busy = phase === "running";

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Tokenizing your catalog"
        phase={phase}
        detail={detail}
        error={error}
        successLine={`${specItemCount(run).toLocaleString()} items tokenized`}
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
          {building ? (
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

              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Your catalog</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a CSV with one row per item, together with the files it names.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Template
                  </Button>
                </div>

                <CatalogDrop onFiles={attach} disabled={busy} />

                {csv ? (
                  <p className="text-sm text-muted-foreground">
                    {csv.name} · {files.length.toLocaleString()} files attached
                  </p>
                ) : null}

                {manifest && manifest.problems.length > 0 ? (
                  <ul className="space-y-1 text-sm text-destructive">
                    {manifest.problems.slice(0, 10).map((p) => (
                      <li key={`${p.row}-${p.message}`}>{p.message}</li>
                    ))}
                    {manifest.problems.length > 10 ? <li>And {manifest.problems.length - 10} more</li> : null}
                  </ul>
                ) : null}

                {manifest && manifest.items.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl bg-muted/40">
                    <table className="w-full text-left text-sm">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 font-medium">Name</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">File</th>
                          <th className="px-4 py-2 font-medium">Cover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manifest.items.slice(0, 50).map((item) => (
                          <tr key={item.row} className="border-t border-border">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.ipType}</td>
                            <td className="px-4 py-2">{item.file.name}</td>
                            <td className="px-4 py-2">{item.image?.name ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="px-4 py-2 text-sm text-muted-foreground">
                      {manifest.items.length.toLocaleString()} {manifest.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                ) : null}
              </section>

              <CollapsibleSection
                open={termsOpen}
                onOpenChange={setTermsOpen}
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                label="Licensing terms"
                hint={`${terms.licenseType} · AI ${terms.aiPolicy.toLowerCase()}`}
              >
                <p className="text-xs text-muted-foreground">These travel with every item in the catalog.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="License">
                    <Select
                      value={terms.licenseType}
                      options={LICENSE_TYPES.map((l) => ({ value: l.value, label: l.label }))}
                      onChange={(v) => setTerms((t) => withPreset(t, v))}
                      disabled={busy}
                    />
                  </Field>
                  <Field label="AI and data mining">
                    <Select
                      value={terms.aiPolicy}
                      options={AI_POLICIES.map((v) => ({ value: v, label: v }))}
                      onChange={(v) => setTerms((t) => ({ ...t, aiPolicy: v as Terms["aiPolicy"] }))}
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Territory">
                    <Select
                      value={terms.territory}
                      options={GEOGRAPHIC_SCOPES.map((v) => ({ value: v, label: v }))}
                      onChange={(v) => setTerms((t) => ({ ...t, territory: v }))}
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Royalty %">
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={terms.royalty}
                      onChange={(e) => setTerms((t) => ({ ...t, royalty: Math.min(50, Math.max(0, Number(e.target.value) || 0)) }))}
                      disabled={busy}
                    />
                  </Field>
                </div>
              </CollapsibleSection>

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

          {executing && run ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Your run is paid for</h2>
              <p className="text-sm text-muted-foreground">
                {specItemCount(run).toLocaleString()} items. Continue anytime and it picks up where it stopped.
              </p>
              {missing.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm">Attach these files to continue: {missing.join(", ")}</p>
                  <CatalogDrop onFiles={attach} disabled={busy} />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => execute(run)} disabled={busy} size="lg">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Continue
                </Button>
                <Button variant="ghost" onClick={cancel} disabled={busy}>
                  Cancel and refund what is left
                </Button>
              </div>
            </section>
          ) : null}

          {status === "COMPLETED" || status === "CANCELLED" ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                {status === "COMPLETED"
                  ? `${specItemCount(run).toLocaleString()} items tokenized`
                  : "This run was cancelled and what it did not use is back in your credits"}
              </h2>
              <Button onClick={startOver}>Start another run</Button>
            </section>
          ) : null}

          {error && phase !== "error" ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </ServiceFormShell>
    </>
  );
}

function CatalogDrop({ onFiles, disabled }: { onFiles: (files: FileList | null) => void; disabled?: boolean }) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      <input type="file" multiple className="hidden" disabled={disabled} onChange={(e) => onFiles(e.target.files)} />
      <Upload className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Drop your CSV and files here, or click to choose them</span>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
