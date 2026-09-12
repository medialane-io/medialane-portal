"use client";

import { useState } from "react";
import {
  ScanFace, KeyRound, Zap, Lock, ShieldCheck, Users, Ticket, Receipt,
  Wallet, Gauge, Bot, Fingerprint, Layers, Globe, type LucideIcon,
} from "lucide-react";

const VALUE_PROPS: { label: string; icon: LucideIcon }[] = [
  { label: "Sign in with a glance", icon: ScanFace },
  { label: "No seed phrase", icon: KeyRound },
  { label: "Self custody", icon: Lock },
  { label: "Issue to a list", icon: Users },
  { label: "Everyone gets a wallet", icon: Wallet },
  { label: "Tickets and memberships", icon: Ticket },
  { label: "Sponsored transactions", icon: Zap },
  { label: "Pay per call", icon: Receipt },
  { label: "Priced up front", icon: Gauge },
  { label: "Keys for your agents", icon: Bot },
  { label: "Immutable contracts", icon: Layers },
  { label: "Asset provenance", icon: Fingerprint },
  { label: "Worldwide protection", icon: ShieldCheck },
  { label: "Works anywhere", icon: Globe },
];

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 gap-4"
      aria-hidden={hidden || undefined}
      data-testid={hidden ? undefined : "value-prop-track-primary"}
    >
      {VALUE_PROPS.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex aspect-[3/4] w-[200px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 text-center"
        >
          <Icon className="h-7 w-7 text-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ValuePropCarousel() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="value-prop-fade overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="value-prop-track flex w-max gap-4" data-paused={paused}>
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
