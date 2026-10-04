"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceHeader, CollapsibleSection, Label } from "@medialane/ui";
import { ArrowLeft, Loader2, ShieldCheck, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { usePortalSession } from "@/hooks/use-portal-account";
import { useRunsClient } from "@/hooks/use-runs-client";
import { useRunExecution } from "@/hooks/use-run-execution";
import { useArtwork } from "@/hooks/use-artwork";
import { useGroupChoice } from "@/hooks/use-group-choice";
import { CheckoutPanel } from "@/components/launchpad/checkout-panel";
import type { CollectionOption } from "./collection-picker";
import { GroupSection } from "./group-section";
import { RecipientsSection } from "./recipients-section";
import { ArtworkDrop } from "./artwork-drop";
import { ClosedRunSection, PaidRunSection, recipientCount } from "./issued-run-sections";
import { Choice, Field } from "@/components/launchpad/form-fields";
import { TaskDialog } from "./task-dialog";
import { parseRecipients, invalidRecipients } from "@/lib/launchpad/recipients";
import { issuedSummary } from "@/lib/launchpad/task-progress";
import { capacity, validitySentence } from "@/lib/launchpad/ticketing/event";
import {
  maxSupplyFor,
  validityError,
  LICENSE_PRESETS,
  AI_POLICIES,
  TERRITORIES,
} from "@/lib/launchpad/issuance-form";
import { LAUNCHPAD } from "@/lib/launchpad/services";
import type { LaunchpadRun } from "@medialane/sdk";
import { executeTicketingRun, describeTicketingEvent, ticketingApi } from "@/lib/launchpad/ticketing/executor";
import { existingChoice, ticketingRunSpec, type GroupChoice } from "@/lib/launchpad/ticketing/spec";

const TRANSFERABLE = ["Allowed", "Not Allowed"] as const;

export function IpTicketingTask() {
  const router = useRouter();
  const pathname = usePathname();
  const runParam = useSearchParams().get("run");
  const { address, signer, hasWallet } = useWalletNativeSession();
  const { account, refresh } = usePortalSession();
  const client = useRunsClient();

  const groupState = useGroupChoice<GroupChoice, CollectionOption>(existingChoice);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const art = useArtwork();
  const artwork = art.artwork;
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
  const [needsArtwork, setNeedsArtwork] = useState(false);
  const { phase, detail: progress, error, busy, execute: runWith, save: saveWith, fail, clearError, close } = useRunExecution({
    client,
    signer,
    address,
    describe: describeTicketingEvent,
    onRun: setRun,
    onNeedsFiles: () => setNeedsArtwork(true),
    onSuccess: () => {
      setGuests("");
      void refresh();
    },
  });
  const status = run?.status ?? "DRAFT";

  useEffect(() => {
    if (!runParam || run?.id === runParam) return;
    client
      .get(runParam)
      .then(setRun)
      .catch((e) => fail(e instanceof Error ? e.message : "Could not open this run.", "idle"));
  }, [runParam, run?.id, client, fail]);

  const recipients = parseRecipients(guests);
  const invalid = invalidRecipients(recipients);
  const windowError = validityError(validFrom, validUntil);

  const room = capacity(supply, recipients.length);
  const hasRun = recipients.length > 0;

  const group = groupState.choice;

  function chooseArtwork(file: File | undefined) {
    if (art.choose(file)) setNeedsArtwork(false);
  }

  const ready =
    Boolean(address) &&
    group !== null &&
    name.trim().length > 0 &&
    recipients.length > 0 &&
    invalid.length === 0 &&
    maxSupplyFor(recipients.length, supply) !== null &&
    !windowError;

  const save = () =>
    group
      ? saveWith(async () => {
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
            run?.status === "DRAFT" ? await client.update(run.id, spec) : await client.create(LAUNCHPAD.ticketing.run, spec);
          router.replace(`${pathname}?run=${saved.id}`);
          return saved;
        })
      : undefined;

  function execute(target: LaunchpadRun) {
    setNeedsArtwork(false);
    return runWith(target, ({ deps, emit }) =>
      executeTicketingRun(
        target.id,
        {
          ...deps,
          client: ticketingApi(client),
          artwork,
          userAddress: address!,
          collectionBase: client.runCollectionBase,
          tierBase: client.runTierBase,
          batchBase: client.runBatchBase,
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
    setNeedsArtwork(false);
    clearError();
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
        successLine={issuedSummary(recipientCount(run), "guest")}
        onClose={close}
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
                <ArtworkDrop
                  preview={art.preview}
                  onChoose={chooseArtwork}
                  disabled={busy}
                  className="rounded-xl bg-foreground/[0.04] transition-colors hover:bg-foreground/[0.07]"
                  imageClassName="rounded-xl"
                />
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
              {art.error ? <p className="text-destructive">{art.error}</p> : null}
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
            <RecipientsSection heading="Guest list" noun="guest" value={guests} onChange={setGuests} disabled={busy} />

            <GroupSection
              heading="Group"
              words={{
                existing: "One of my groups",
                fresh: "A new group",
                nameLabel: "Group name",
                namePlaceholder: "Summer series",
                symbolPlaceholder: "SUMMER",
              }}
              group={groupState}
              serviceId={LAUNCHPAD.ticketing.collections}
              owner={address ?? ""}
              disabled={busy}
              inputClassName="h-11"
            />

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
              <PaidRunSection
                run={run}
                unit="ticket"
                needsArtwork={needsArtwork}
                busy={busy}
                onContinue={() => execute(run)}
                onCancel={cancel}
                buttonClassName="h-12"
              />
            ) : null}

            {run && (status === "COMPLETED" || status === "CANCELLED") ? (
              <ClosedRunSection run={run} noun="guest" onStartOver={startOver} />
            ) : null}

            {error && phase === "idle" ? <p className="text-destructive">{error}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}
