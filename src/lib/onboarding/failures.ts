import type { PasskeySupport } from "./passkey-support";

export type WalletFailureKind =
  | "cancelled"
  | "no-passkeys"
  | "unsupported-browser"
  | "network"
  | "still-deploying"
  | "deployment"
  | "unknown";

export interface WalletFailureNotice {
  kind: WalletFailureKind;
  message: string;
  canRetry: boolean;
}

export const isPasskeyCancelled = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as { name?: unknown }).name === "PasskeyCancelledError";

const message = (err: unknown): string => (err instanceof Error ? err.message : "");

export function describeWalletFailure(err: unknown, support: PasskeySupport = "unknown"): WalletFailureNotice {
  const raw = message(err);

  if (isPasskeyCancelled(err)) {
    return support === "unavailable"
      ? {
          kind: "no-passkeys",
          message: "Passkeys aren't available in this window. Open Medialane in a regular browser window (not Guest or Incognito) and try again.",
          canRetry: true,
        }
      : {
          kind: "cancelled",
          message:
            "The passkey prompt was closed. Try again to finish setting up your account. If your browser says your device can't be used, open Medialane in a regular browser window (not Guest or Incognito).",
          canRetry: true,
        };
  }

  if (/PRF/.test(raw)) {
    return { kind: "unsupported-browser", message: "Browser not supported. Please try another browser.", canRetry: false };
  }

  if (/has not appeared|submitted but/i.test(raw)) {
    return {
      kind: "still-deploying",
      message: "Your wallet is still being set up. Give it a minute, then try again. Nothing is lost.",
      canRetry: true,
    };
  }

  if (/deploy/i.test(raw)) {
    return { kind: "deployment", message: "We couldn't finish setting up your wallet. Please try again in a moment.", canRetry: true };
  }

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return { kind: "network", message: "We couldn't reach Medialane. Check your connection and try again.", canRetry: true };
  }

  return { kind: "unknown", message: "We couldn't finish setting up your account. Please try again.", canRetry: true };
}
