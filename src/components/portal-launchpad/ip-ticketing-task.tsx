"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceHeader, CollapsibleSection, Label } from "@medialane/ui";
import { executeSponsored, type TypedDataSigner } from "@medialane/sdk/starknet";
import { ArrowLeft, Check, Loader2, ShieldCheck, Ticket, Upload, Users } from "lucide-react";
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
import { capacity, guestRows, repeatsIn, validitySentence } from "@/lib/portal-launchpad/ticket-event";
import {
  imageRejectionReason,
  maxSupplyFor,
  validityError,
  LICENSE_PRESETS,
  AI_POLICIES,
  TERRITORIES,
} from "@/lib/portal-launchpad/issuance-form";
import { TICKETING_SERVICE } from "@/lib/portal-launchpad/collection-copy";
import type { LaunchpadRun } from "@medialane/sdk";
import { MissingFilesError, putFileToSignedUrl } from "@/lib/launchpad/run-executor";
import { executeTicketingRun, type TicketingEvent } from "@/lib/ticketing/run-executor";
import { existingChoice, ticketingRunSpec, type GroupChoice } from "@/lib/ticketing/spec";

const TRANSFERABLE = ["Allowed", "Not Allowed"] as const;

function describe(event: TicketingEvent): string {
  switch (event.kind) {
    case "collection":
      return "Confirm your new group in your wallet";
    case "upload":
      return "Uploading artwork";
    case "ticket-metadata":
      return "Preparing ticket";
    case "tier":
      return "Confirm ticket in your wallet";
    case "wallets":
      return `Preparing guest ${event.done + 1} of ${event.total}`;
    case "batch":
      return `Confirm tickets ${event.index + 1} in your wallet`;
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

export function IpTicketingTask() {
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
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [supply, setSupply] = useState("");
  const [guests, setGuests] = useState("");
  const [royalty, setRoyalty] = useState("0");

  const [termsOpen, setTermsOpen] = useState(false);
  const [licenseType, setLicenseType] = useState<string>("All Rights Reserved");
  const [aiPolicy, setAiPolicy] = useState<string>("Not Allowed");
  const [transferable, setTransferable] = useState<string>("Allowed");
  const [territory, setTerritory] = useState<string>("Worldwide");

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
  const windowError = validityError(validFrom, validUntil);

  const room = capacity(supply, recipients.length);
  const hasRun = recipients.length > 0;
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
    invalid.length === 0 &&
    maxSupplyFor(recipients.length, supply) !== null &&
    !windowError;

  async function save() {
    if (!group) return;
    setPhase("running");
    setProgress("Saving your run");
    setError(null);
    try {
      const spec = ticketingRunSpec({
        collection: group,
        name,
        description,
        artwork,
        validFrom,
        validUntil,
        supply,
        guests: recipients.map((r) => r.value),
        terms: { licenseType, aiPolicy, transferable, territory, royalty },
      });
      const saved =
        run?.status === "DRAFT" ? await client.update(run.id, spec) : await client.create(TICKETING_SERVICE, spec);
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
      const finished = await executeTicketingRun(
        target.id,
        {
          client: { get: client.get, ...client.ticketing },
          artwork,
          userAddress: address,
          collectionBase: client.runCollectionBase,
          tierBase: client.runTierBase,
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
        <h1 className="text-2xl font-bold tracking-tight">IP Ticketing</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to create tickets and distribute them to a list of people.
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
        title="Issuing tickets"
        phase={phase}
        detail={progress}
        error={error}
        successLine={issuedSummary(guestCount(run), "guest")}
        onClose={() => setPhase("idle")}
      />

      <div className="mx-auto max-w-[110rem] px-4 pt-16 pb-16 sm:px-6 sm:pt-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <Link
              href="/launchpad"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Launchpad
            </Link>
            <ServiceHeader
              bare
              className="mt-2"
              icon={<Ticket className="h-4 w-4 text-white" />}
              title="IP Ticketing"
              subtitle="Create a ticket and distribute it to a guest list."
            />
          </div>
          <p className="text-muted-foreground">
            {validitySentence(validFrom, validUntil)}
            {hasRun
              ? ` · ${room.exists.toLocaleString()} exist · ${room.issuingNow.toLocaleString()} going out`
              : ""}
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-10 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="font-semibold">Ticket</h2>

              <Field label="Artwork">
                <label
                  className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl bg-foreground/[0.04] transition-colors hover:bg-foreground/[0.07]"
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
                    <img src={artworkPreview} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <Upload className="h-5 w-5" />
                      Artwork
                    </span>
                  )}
                </label>
              </Field>

              <Field label="Name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="General admission"
                  className="h-11"
                  disabled={busy}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What it admits, when, and where"
                  rows={3}
                  disabled={busy}
                />
              </Field>
              {artworkError ? <p className="text-destructive">{artworkError}</p> : null}
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold">Validity</h2>
              <div className="space-y-3">
                <Field label="From">
                  <Input
                    type="datetime-local"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </Field>
                <Field label="Until">
                  <Input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </Field>
              </div>
              {windowError ? (
                <p className="text-destructive">{windowError}</p>
              ) : (
                <p className="text-muted-foreground">{validitySentence(validFrom, validUntil)}.</p>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold">Supply</h2>
              <Field label="How many">
                <Input
                  type="number"
                  min={recipients.length || 1}
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  placeholder={recipients.length ? String(recipients.length) : "100"}
                  className="h-11"
                  disabled={busy}
                />
              </Field>
              <div>
                {!hasRun ? (
                  <p className="text-muted-foreground">Empty matches the guest list.</p>
                ) : room.shortBy > 0 ? (
                  <p className="text-destructive">
                    {room.shortBy.toLocaleString()} more {room.shortBy === 1 ? "ticket" : "tickets"} needed
                    to cover the list.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {room.issuingNow.toLocaleString()} of {room.exists.toLocaleString()} going out now.
                  </p>
                )}
              </div>
            </section>

            <CollapsibleSection
              open={termsOpen}
              onOpenChange={setTermsOpen}
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              label="Licensing terms"
              hint="Optional"
            >
              <p className="text-muted-foreground">Tickets are tradable assets. These terms travel with them.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Passing on</Label>
                  <Choice value={transferable} options={TRANSFERABLE} onChange={setTransferable} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Resale royalty %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={royalty}
                    onChange={(e) => setRoyalty(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <Label>License</Label>
                  <Choice value={licenseType} options={LICENSE_PRESETS} onChange={setLicenseType} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>AI and data mining</Label>
                  <Choice value={aiPolicy} options={AI_POLICIES} onChange={setAiPolicy} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Territory</Label>
                  <Choice value={territory} options={TERRITORIES} onChange={setTerritory} disabled={busy} />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold">Guest list</h2>
                <p className="text-muted-foreground">
                  {rows.length.toLocaleString()} {rows.length === 1 ? "guest" : "guests"}
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
                <ul className="divide-y divide-border">
                  {rows.map((row) => (
                    <li key={row.value} className="flex items-center justify-between gap-4 py-2.5">
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

            <section className="space-y-4">
              <h2 className="font-semibold">Group</h2>
              <div className="flex gap-2">
                <Button
                  variant={groupMode === "existing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupMode("existing")}
                  disabled={busy}
                >
                  One of my groups
                </Button>
                <Button
                  variant={groupMode === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupMode("new")}
                  disabled={busy}
                >
                  A new group
                </Button>
              </div>
              {groupMode === "existing" ? (
                <CollectionPicker
                  hideLabel
                  serviceId={TICKETING_SERVICE}
                  owner={address ?? ""}
                  value={existingGroup?.kind === "existing" ? existingGroup.contractAddress : ""}
                  onChange={(c) => setExistingGroup(existingChoice(c))}
                  disabled={busy}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Group name">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Summer series" className="h-11" disabled={busy} />
                  </Field>
                  <Field label="Short code">
                    <Input value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} placeholder="SUMMER" className="h-11" disabled={busy} />
                  </Field>
                </div>
              )}
            </section>

            {status === "DRAFT" ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button onClick={save} disabled={!ready || busy} size="lg" className="h-12">
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
                  {!address ? <span className="text-muted-foreground">Sign in to issue.</span> : null}
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
              </section>
            ) : null}

            {run && (status === "PAID" || status === "RUNNING") ? (
              <section className="space-y-4">
                <h2 className="font-semibold">Your run is paid for</h2>
                <p className="text-muted-foreground">
                  {guestCount(run).toLocaleString()} {guestCount(run) === 1 ? "ticket" : "tickets"}. Continue anytime and it picks up where it stopped.
                </p>
                {needsArtwork ? (
                  <p>Attach the artwork again to continue: {(run.spec as { artwork?: { name: string } }).artwork?.name}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => execute(run)} disabled={busy} size="lg" className="h-12">
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
                <h2 className="font-semibold">
                  {status === "COMPLETED"
                    ? issuedSummary(guestCount(run), "guest")
                    : "This run was cancelled and what it did not use is back in your credits"}
                </h2>
                <Button onClick={startOver}>Start another run</Button>
              </section>
            ) : null}

            {error && phase !== "error" ? <p className="text-destructive">{error}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}
