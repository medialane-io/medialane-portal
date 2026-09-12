import { getTokenByAddress, type ApiWalletActivity } from "@medialane/sdk";
import { CurrencyIcon } from "@medialane/ui";

export function WalletActivityIcon({ a }: { a: ApiWalletActivity }) {
  if (a.type === "SEND" || a.type === "RECEIVE") {
    const symbol = a.tokenAddress ? getTokenByAddress(a.tokenAddress)?.symbol : undefined;
    if (symbol) {
      return (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
          <CurrencyIcon symbol={symbol} size={22} />
        </div>
      );
    }
    return <ActionIcon hue={a.type === "RECEIVE" ? "#3b7bff" : "#f6608f"}>{a.type === "RECEIVE" ? <ArrowDownIcon /> : <ArrowUpIcon />}</ActionIcon>;
  }
  if (a.type === "SWAP") return <ActionIcon hue="#8a3ff0"><SwapIcon /></ActionIcon>;
  if (a.type === "DEPLOY") return <ActionIcon hue="#fb7a32"><RocketIcon /></ActionIcon>;
  return <ActionIcon hue="#5b4ce6"><ShieldIcon /></ActionIcon>;
}

function ActionIcon({ hue, children }: { hue: string; children: React.ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-foreground/[0.06]" style={{ color: hue }}>
      {children}
    </span>
  );
}

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function ArrowDownIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M12 4v16M6 14l6 6 6-6" /></svg>; }
function ArrowUpIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M12 20V4M6 10l6-6 6 6" /></svg>; }
function SwapIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M7 10l-3-3 3-3M4 7h13M17 14l3 3-3 3M20 17H7" /></svg>; }
function RocketIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>; }
function ShieldIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>; }
