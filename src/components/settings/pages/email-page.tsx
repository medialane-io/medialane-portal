"use client";

import { describeError } from "@medialane/ui";
import { useState } from "react";
import { CheckCircle2, Clock, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountSection } from "@/components/settings/account-section";
import { SettingsGate, SettingsPage } from "@/components/settings/settings-shell";
import { EmailVerifyDialog } from "@/components/settings/email-verify-dialog";
import { useAccountEmail } from "@/hooks/use-account-email";

export default function EmailSettingsPage() {
  const { status, markVerified, changeEmail } = useAccountEmail();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [codeAlreadySent, setCodeAlreadySent] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);


  async function handleChange() {
    const email = input.trim();
    if (!email) return;
    setBusy("saving");
    setError(null);
    try {
      await changeEmail(email);
      setEditOpen(false);
      setInput("");
      setCodeAlreadySent(true);
      setDialogOpen(true);
    } catch (err) {
      setError(describeError(err, "We couldn't update your email. Please try again.").message);
    } finally {
      setBusy("idle");
    }
  }

  function cancelEdit() {
    setEditOpen(false);
    setInput("");
    setError(null);
  }

  return (
    <SettingsGate>
      <SettingsPage title="Email" subtitle="Used for account notices and signing back in.">
        <AccountSection
          icon={Mail}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/10"
          title="Email"
          description="This is how you sign in on a new device."
        >
          {status === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : editOpen ? (
            <div className="space-y-3">
              <Input
                type="email"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                disabled={busy === "saving"}
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && input.trim() && void handleChange()}
              />
              <div className="flex gap-2">
                <Button onClick={handleChange} disabled={!input.trim() || busy === "saving"} className="flex-1 sm:flex-none">
                  {busy === "saving" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
                <Button variant="ghost" onClick={cancelEdit} disabled={busy === "saving"}>
                  Cancel
                </Button>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <p className="text-xs text-muted-foreground">We&apos;ll send a code to the new address. Until you verify it, email sign-in is off.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {status.email ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 truncate text-sm text-foreground">{status.email}</span>
                  {status.verified ? (
                    <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-yellow-500/40 bg-yellow-500/10 text-[10px] text-yellow-700 dark:text-yellow-400">
                      <Clock className="h-3 w-3" /> Not verified
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No email on this account yet.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {status.email && !status.verified ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCodeAlreadySent(false);
                      setDialogOpen(true);
                    }}
                  >
                    Verify email
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditOpen(true);
                    setInput(status.email ?? "");
                  }}
                >
                  {status.email ? "Change email" : "Add email"}
                </Button>
              </div>
            </div>
          )}
        </AccountSection>

        {status?.email ? (
          <EmailVerifyDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            email={status.email}
            onVerified={markVerified}
            codeAlreadySent={codeAlreadySent}
          />
        ) : null}
      </SettingsPage>
    </SettingsGate>
  );
}
