import type { EmailStatus, RowTone } from "./rows";
import type { RecoveryState } from "./recovery";

export interface StatusInput {
  address: string | null;
  email: EmailStatus | null;
  walletDeployed: boolean | null;
  devices: number | null;
  recovery: RecoveryState;
}

export interface StatusHeadline {
  tone: RowTone;
  text: string;
  href?: string;
}

export interface StatusLine {
  id: "signin" | "wallet" | "devices" | "recovery";
  label: string;
  value: string | null;
  note?: { text: string; tone: RowTone };
  action?: { label: string; href: string };
}

const shortAddress = (a: string): string => `${a.slice(0, 6)}…${a.slice(-4)}`;

function headline({ email, walletDeployed, recovery }: StatusInput): StatusHeadline | null {
  if (email === null || walletDeployed === null || recovery === "unknown") return null;
  if (!email.email) return { tone: "warn", text: "Add your email to keep your account", href: "/settings/email" };
  if (!email.verified) return { tone: "warn", text: "Confirm your email to keep your account", href: "/settings/email" };
  if (!walletDeployed) return { tone: "muted", text: "Your wallet is still setting up" };
  if (recovery === "missing") {
    return { tone: "warn", text: "Set up recovery so you cannot lose access", href: "/settings/recovery" };
  }
  return { tone: "ok", text: "Everything is working" };
}

export function accountStatus(input: StatusInput): { headline: StatusHeadline | null; lines: StatusLine[] } {
  const { address, email, walletDeployed, devices, recovery } = input;

  const signin: StatusLine = {
    id: "signin",
    label: "Sign-in",
    value: email === null ? null : (email.email ?? "No email yet"),
    note: email?.email ? (email.verified ? { text: "Confirmed", tone: "ok" } : { text: "Not confirmed", tone: "warn" }) : undefined,
  };

  const wallet: StatusLine = {
    id: "wallet",
    label: "Wallet",
    value: address && walletDeployed !== null ? shortAddress(address) : null,
    note: walletDeployed === null ? undefined : walletDeployed ? { text: "Live onchain", tone: "ok" } : { text: "Setting up", tone: "muted" },
  };

  const deviceLine: StatusLine = {
    id: "devices",
    label: "Devices",
    value: devices === null ? null : `${devices} signing device${devices === 1 ? "" : "s"}`,
  };

  const recoveryLine: StatusLine = {
    id: "recovery",
    label: "Recovery",
    value: recovery === "unknown" ? null : recovery === "ready" ? "Ready" : "Not set up",
    action: recovery === "missing" ? { label: "Set up", href: "/settings/recovery" } : undefined,
  };

  return { headline: headline(input), lines: [signin, wallet, deviceLine, recoveryLine] };
}
