"use client";

import { describeError } from "@medialane/ui";
import { useState } from "react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePortalKeys } from "@/hooks/use-portal-account";
import { useFreshSignature } from "@/hooks/use-fresh-signature";
import { getMedialaneClient } from "@/lib/medialane-client";
import { MedialaneApiError } from "@medialane/sdk";

const NOT_CONFIRMED = "We could not confirm it is you. Please try again.";
const REPLACE_WARNING =
  "Replacing the key stops the current key working right away. Anything that uses it must be updated with the new key. Continue?";

function unconfirmed(err: unknown): never {
  if (err instanceof MedialaneApiError && err.status === 401) throw new Error(NOT_CONFIRMED);
  throw err;
}

export function ApiKeys() {
  const { data: keys, mutate } = usePortalKeys(true);
  const signFresh = useFreshSignature();
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hasKey = (keys?.length ?? 0) > 0;

  async function confirm(): Promise<string> {
    const token = await signFresh().catch(() => null);
    if (!token) throw new Error(NOT_CONFIRMED);
    return token;
  }

  async function create() {
    if (hasKey && !window.confirm(REPLACE_WARNING)) return;
    setBusy(true);
    try {
      const token = await confirm();
      const body = await getMedialaneClient().api.createApiKey({}, token).catch(unconfirmed);
      setPlaintext(body.data.plaintext);
      await mutate();
    } catch (err) {
      toast.error(describeError(err, "Could not create the key").message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const token = await confirm();
      await getMedialaneClient().api.deleteApiKey(id, token).catch(unconfirmed);
      setPlaintext(null);
      await mutate();
    } catch (err) {
      toast.error(describeError(err, "Could not delete the key").message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">API key</h2>
          <p className="text-sm text-muted-foreground">
            Your key connects your app or the WordPress plugin to Medialane. Every request it makes is paid from this
            account&apos;s credits. An account has one key.
          </p>
        </div>
        <Button onClick={create} disabled={busy} size="sm">
          {hasKey ? "Replace key" : "Create key"}
        </Button>
      </div>

      {plaintext ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-medium">Copy this now. It is not shown again.</p>
          <p className="text-sm text-muted-foreground">Keep it secret: anyone who has it can spend your credits.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg bg-background px-3 py-2 font-mono text-xs">
              {plaintext}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(plaintext);
                toast.success("Copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {keys && keys.length > 0 ? (
        <div className="space-y-2">
        <ul className="divide-y divide-border/40">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm">{key.prefix}…</p>
                <p className="text-xs text-muted-foreground">
                  {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => remove(key.id)}
                aria-label="Delete key"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Delete the key to stop it working right away.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <KeyRound className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No key yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create it to connect an app or the WordPress plugin.</p>
        </div>
      )}
    </section>
  );
}
