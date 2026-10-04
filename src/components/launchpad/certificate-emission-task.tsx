"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ServiceFormShell, ClaimRail, CollapsibleSection } from "@medialane/ui";
import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { ArrowLeft, Award, Layers, Loader2, ShieldCheck, Users, Wallet } from "lucide-react";
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
import type { LaunchpadRun } from "@medialane/sdk";
import { LAUNCHPAD } from "@/lib/launchpad/services";
import { executeCertificateEmissionRun, describeCertificateEvent, certificateEmissionApi } from "@/lib/launchpad/certificate-emission/executor";
import { existingChoice, certificateEmissionRunSpec, defaultTerms, withPreset, type GroupChoice } from "@/lib/launchpad/certificate-emission/spec";

export function CertificateEmissionTask() {
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
  const [guests, setGuests] = useState("");
  const [terms, setTerms] = useState(defaultTerms);
  const [termsOpen, setTermsOpen] = useState(false);

  const [run, setRun] = useState<LaunchpadRun | null>(null);
  const [needsArtwork, setNeedsArtwork] = useState(false);
  const { phase, detail: progress, error, busy, execute: runWith, save: saveWith, fail, clearError, close } = useRunExecution({
    client,
    signer,
    address,
    describe: describeCertificateEvent,
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

  const group = groupState.choice;

  function chooseArtwork(file: File | undefined) {
    if (art.choose(file)) setNeedsArtwork(false);
  }

  const ready =
    Boolean(address) &&
    group !== null &&
    name.trim().length > 0 &&
    recipients.length > 0 &&
    invalid.length === 0;

  const save = () =>
    group
      ? saveWith(async () => {
          const spec = certificateEmissionRunSpec({
            collection: group,
            name,
            description,
            artwork,
            guests: recipients.map((r) => r.value),
            terms,
          });
          const saved =
            run?.status === "DRAFT" ? await client.update(run.id, spec) : await client.create(LAUNCHPAD.certificates.run, spec);
          router.replace(`${pathname}?run=${saved.id}`);
          return saved;
        })
      : undefined;

  function execute(target: LaunchpadRun) {
    setNeedsArtwork(false);
    return runWith(target, ({ deps, emit }) =>
      executeCertificateEmissionRun(
        target.id,
        {
          ...deps,
          client: certificateEmissionApi(client),
          artwork,
          userAddress: address!,
          collectionBase: client.runCollectionBase,
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
        successLine={issuedSummary(recipientCount(run), "recipient")}
        onClose={close}
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
        <div className="space-y-8 text-sm">
          {status === "DRAFT" ? (
            <>
              <GroupSection
                heading="Collection"
                headingClassName="text-lg font-semibold"
                words={{
                  existing: "One of my collections",
                  fresh: "A new collection",
                  nameLabel: "Collection name",
                  namePlaceholder: "Onboarding 2026",
                  symbolPlaceholder: "ONB26",
                }}
                group={groupState}
                serviceId={LAUNCHPAD.certificates.collections}
                owner={address ?? ""}
                disabled={busy}
              />

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Certificate</h2>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <ArtworkDrop
                    preview={art.preview}
                    onChoose={chooseArtwork}
                    disabled={busy}
                    className="rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50"
                    imageClassName="rounded-[10px]"
                  />

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
                {art.error ? <p className="text-sm text-destructive">{art.error}</p> : null}
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

              <RecipientsSection
                heading="Recipient list"
                headingClassName="text-lg font-semibold"
                noun="recipient"
                value={guests}
                onChange={setGuests}
                disabled={busy}
                listClassName="divide-y divide-border rounded-xl bg-muted/40 px-4"
              />

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
            <PaidRunSection
              run={run}
              unit="certificate"
              needsArtwork={needsArtwork}
              busy={busy}
              onContinue={() => execute(run)}
              onCancel={cancel}
              headingClassName="text-lg font-semibold"
            />
          ) : null}

          {run && (status === "COMPLETED" || status === "CANCELLED") ? (
            <ClosedRunSection run={run} noun="recipient" onStartOver={startOver} headingClassName="text-lg font-semibold" />
          ) : null}

          {error && phase === "idle" ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </ServiceFormShell>
    </>
  );
}
