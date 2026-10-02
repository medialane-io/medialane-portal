"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceFormShell, ClaimRail, CollapsibleSection } from "@medialane/ui";
import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { executeSponsored, type TypedDataSigner } from "@medialane/sdk/starknet";
import { ArrowLeft, Award, Check, Layers, Loader2, ShieldCheck, Upload, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import { CheckoutPanel } from "@/components/launchpad/checkout-panel";
import { CollectionPicker } from "./collection-picker";
import { Choice, Field } from "@/components/launchpad/form-fields";
import { TaskDialog } from "./task-dialog";
import { parseRecipients, invalidRecipients } from "@/lib/portal-launchpad/provisioning";
import { issuedSummary, type TaskPhase } from "@/lib/portal-launchpad/task-progress";
import { guestRows, repeatsIn } from "@/lib/portal-launchpad/ticket-event";
import { imageRejectionReason } from "@/lib/portal-launchpad/issuance-form";
import type { LaunchpadRun } from "@medialane/sdk";
import { MissingFilesError, putFileToSignedUrl } from "@/lib/launchpad/run-executor";
import { executeCertificateEmissionRun, type CertificateEmissionEvent } from "@/lib/certificate-emission/run-executor";
import { existingChoice, certificateEmissionRunSpec, defaultTerms, withPreset, type GroupChoice } from "@/lib/certificate-emission/spec";

const CERTIFICATE_EMISSION_SERVICE = "certificate-emission";

function describe(event: CertificateEmissionEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new collection in your wallet";
    case "upload":
      return "Uploading artwork";
    case "certificate-metadata":
      return "Preparing certificate";
    case "wallets":
      return `Preparing recipient ${event.done + 1} of ${event.total}`;
    case "batch":
      return `Confirm certificates ${event.index + 1} in your wallet`;
    case "confirming":
      return "Waiting for confirmation";
    case "done":
      return "Done";
  }
}

const guestCount = (run: LaunchpadRun | null) => {
  const guests = (run?.spec as { guests?: unknown[] } | undefined)?.guests;
  return Array.isArray(guests) ? guests.length : 0;
};

export function CertificateEmissionTask() {
  const router = useRouter();
  const pathname = usePathname();
  const runParam = useSearchParams().get("run");
  const { address, signer, hasWallet } = useWalletNativeSession();
  const { account, refresh } = usePortalSession();
  const client = useRunsClient();

  const [groupMode, setGroupMode] = useState<"existing" | "new">("existing");
  const [existingGroup, setExistingGroup] = useState<GroupChoice | null>(null);
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [artwork, setArtwork] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [guests, setGuests] = useState("");
  const [terms, setTerms] = useState(defaultTerms);
  const [termsOpen, setTermsOpen] = useState(false);

  const [run, setRun] = useState<LaunchpadRun | null>(null);
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsArtwork, setNeedsArtwork] = useState(false);
  const busy = phase === "running";
  const status = run?.status ?? "DRAFT";

  useEffect(() => {
    if (!runParam || run?.id === runParam) return;
    client
      .get(runParam)
      .then(setRun)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not open this run."));
  }, [runParam, run?.id, client]);

  const recipients = parseRecipients(guests);
  const invalid = invalidRecipients(recipients);
  const rows = guestRows(guests);
  const repeats = repeatsIn(guests);

  const group: GroupChoice | null =
    groupMode === "new"
      ? newName.trim() && newSymbol.trim()
        ? { kind: "new", name: newName.trim(), symbol: newSymbol.trim().toUpperCase() }
        : null
      : existingGroup;

  function chooseArtwork(file: File | undefined) {
    if (!file) return;
    const reason = imageRejectionReason(file);
    setArtworkError(reason);
    if (reason) return;
    setArtwork(file);
    setArtworkPreview(URL.createObjectURL(file));
    setNeedsArtwork(false);
  }

  const ready =
    Boolean(address) &&
    group !== null &&
    name.trim().length > 0 &&
    recipients.length > 0 &&
    invalid.length === 0;

  async function save() {
    if (!group) return;
    setPhase("running");
    setProgress("Saving your run");
    setError(null);
    try {
      const spec = certificateEmissionRunSpec({
        collection: group,
        name,
        description,
        artwork,
        guests: recipients.map((r) => r.value),
        terms,
      });
      const saved =
        run?.status === "DRAFT"
          ? await client.update(run.id, spec)
          : await client.create(CERTIFICATE_EMISSION_SERVICE, spec);
      setRun(saved);
      router.replace(`${pathname}?run=${saved.id}`);
      setPhase("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this run.");
      setPhase("error");
    } finally {
      setProgress(null);
    }
  }

  async function execute(target: LaunchpadRun) {
    if (!signer || !address) return;
    setRun(target);
    setNeedsArtwork(false);
    setError(null);
    setPhase("running");
    try {
      const finished = await executeCertificateEmissionRun(
        target.id,
        {
          client: { get: client.get, ...client.certificateEmission },
          artwork,
          userAddress: address,
          collectionBase: client.runCollectionBase,
          batchBase: client.runBatchBase,
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
        (event) => setProgress(describe(event)),
      );
      setRun(finished);
      setGuests("");
      setPhase("success");
      refresh();
    } catch (e) {
      if (e instanceof MissingFilesError) {
        setNeedsArtwork(true);
        setPhase("idle");
        return;
      }
      setError(e instanceof Error ? e.message : "The run stopped. Continue to pick up where it left off.");
      setPhase("error");
      setRun(await client.get(target.id).catch(() => target));
    } finally {
      setProgress(null);
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
    setNeedsArtwork(false);
    setError(null);
    router.replace(pathname);
  }

  if (!hasWallet) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Certificate Emission</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to issue certificates and distribute them to a list of people.
        </p>
        <Button asChild className="mt-5">
          <Link href="/connect">Sign in</Link>
        </Button>
      </main>
    );
  }

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Issuing certificates"
        phase={phase}
        detail={progress}
        error={error}
        successLine={issuedSummary(guestCount(run), "recipient")}
        onClose={() => setPhase("idle")}
      />

      <ServiceFormShell
        icon={<Award className="h-4 w-4 text-white" />}
        title="Certificate Emission"
        subtitle="Create a certificate and distribute it to a recipient list — everyone gets a wallet and their certificate."
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
              { icon: ShieldCheck, title: "Soulbound credential", desc: "Non-transferable — each recipient keeps the one they're issued." },
              { icon: Wallet, title: "A wallet for everyone", desc: "We deploy one for any recipient who doesn't already have it." },
              { icon: Layers, title: "Reusable collection", desc: "Issue more certificates into the same collection later." },
            ]}
            steps={["Choose a collection", "Add the certificate's name, description and artwork", "Paste a recipient list and pay once"]}
            trustIcon={ShieldCheck}
            trustLead="You stay in control."
            trust="Every certificate is minted straight to the recipient's own wallet."
          />
        }
      >
        <div className="space-y-8">
          {status === "DRAFT" ? (
            <>
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Collection</h2>
                <div className="flex gap-2">
                  <Button
                    variant={groupMode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGroupMode("existing")}
                    disabled={busy}
                  >
                    One of my collections
                  </Button>
                  <Button
                    variant={groupMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGroupMode("new")}
                    disabled={busy}
                  >
                    A new collection
                  </Button>
                </div>
                {groupMode === "existing" ? (
                  <CollectionPicker
                    hideLabel
                    serviceId="pop-protocol"
                    owner={address ?? ""}
                    value={existingGroup?.kind === "existing" ? existingGroup.contractAddress : ""}
                    onChange={(c) => setExistingGroup(existingChoice(c))}
                    disabled={busy}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Collection name">
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Onboarding 2026" disabled={busy} />
                    </Field>
                    <Field label="Short code">
                      <Input value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} placeholder="ONB26" disabled={busy} />
                    </Field>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Certificate</h2>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <label
                    className="flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-center transition-colors hover:border-primary/50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      chooseArtwork(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(e) => chooseArtwork(e.target.files?.[0])}
                    />
                    {artworkPreview ? (
                      <img src={artworkPreview} alt="" className="h-full w-full rounded-[10px] object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">Artwork</span>
                      </span>
                    )}
                  </label>

                  <div className="flex-1 space-y-4">
                    <Field label="Name">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Course completion"
                        disabled={busy}
                      />
                    </Field>

                    <Field label="Description">
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What it certifies"
                        rows={3}
                        disabled={busy}
                      />
                    </Field>
                  </div>
                </div>
                {artworkError ? <p className="text-sm text-destructive">{artworkError}</p> : null}
              </section>

              <CollapsibleSection
                open={termsOpen}
                onOpenChange={setTermsOpen}
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                label="Licensing terms"
                hint={`${terms.licenseType} · AI ${terms.aiPolicy.toLowerCase()}`}
              >
                <p className="text-xs text-muted-foreground">These describe rights over the certificate&apos;s artwork and content — the certificate itself is soulbound and never trades.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="License">
                    <Choice
                      value={terms.licenseType}
                      options={LICENSE_TYPES.map((l) => ({ value: l.value, label: l.label }))}
                      onChange={(v) => setTerms((t) => withPreset(t, v))}
                      disabled={busy}
                    />
                  </Field>
                  <Field label="AI and data mining">
                    <Choice
                      value={terms.aiPolicy}
                      options={AI_POLICIES}
                      onChange={(v) => setTerms((t) => ({ ...t, aiPolicy: v as typeof t.aiPolicy }))}
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Territory">
                    <Choice
                      value={terms.territory}
                      options={GEOGRAPHIC_SCOPES}
                      onChange={(v) => setTerms((t) => ({ ...t, territory: v }))}
                      disabled={busy}
                    />
                  </Field>
                </div>
              </CollapsibleSection>

              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-lg font-semibold">Recipient list</h2>
                  <p className="text-sm text-muted-foreground">
                    {rows.length.toLocaleString()} {rows.length === 1 ? "recipient" : "recipients"}
                    {repeats > 0 ? ` · ${repeats} repeated` : ""}
                  </p>
                </div>

                <Textarea
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder={"Paste a list, or type one address per line\nana@company.com\nbruno@company.com"}
                  rows={6}
                  className="font-mono"
                  disabled={busy}
                />

                {rows.length > 0 ? (
                  <ul className="divide-y divide-border rounded-xl bg-muted/40 px-4">
                    {rows.map((row) => (
                      <li key={row.value} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <span className="truncate">{row.value}</span>
                        {row.valid ? (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <span className="shrink-0 text-destructive">not an email</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>

              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={!ready || busy} size="lg">
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Working
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      {run ? "Save changes" : "Save and review"}
                    </>
                  )}
                </Button>
                {!address ? <span className="text-sm text-muted-foreground">Sign in to issue.</span> : null}
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
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Your run is paid for</h2>
              <p className="text-sm text-muted-foreground">
                {guestCount(run).toLocaleString()} {guestCount(run) === 1 ? "certificate" : "certificates"}. Continue anytime and it picks up where it stopped.
              </p>
              {needsArtwork ? (
                <p className="text-sm">Attach the artwork again to continue: {(run.spec as { artwork?: { name: string } }).artwork?.name}</p>
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

          {run && (status === "COMPLETED" || status === "CANCELLED") ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                {status === "COMPLETED"
                  ? issuedSummary(guestCount(run), "recipient")
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
