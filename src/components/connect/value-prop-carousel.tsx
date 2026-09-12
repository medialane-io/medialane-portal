"use client";

import { useState } from "react";
import {
  ScanFace, Ticket, Users, Layers, Coins, ShieldCheck, Scale,
  Receipt, Bot, Gauge, Fingerprint, Globe, type LucideIcon,
} from "lucide-react";

const VALUE_PROPS: { label: string; icon: LucideIcon }[] = [
  { label: "Tickets", icon: Ticket },
  { label: "Memberships", icon: Users },
  { label: "Editions", icon: Layers },
  { label: "Creator Coins", icon: Coins },
  { label: "Programmable IP", icon: Fingerprint },
  { label: "Licensing", icon: Scale },
  { label: "Worldwide protection", icon: ShieldCheck },
  { label: "Sign in with a glance", icon: ScanFace },
  { label: "Pay per call", icon: Receipt },
  { label: "Priced up front", icon: Gauge },
  { label: "Built for agents", icon: Bot },
  { label: "Open to anyone", icon: Globe },
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
