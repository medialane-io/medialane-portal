"use client";

import { useState } from "react";
import {
  Award, Pencil, Trophy, ScanFace, Sparkles, KeyRound, Globe, Lock,
  ShieldCheck, Radio, Zap, Shuffle, Package, Gem, Fingerprint, Rocket,
  ShoppingBag, type LucideIcon,
} from "lucide-react";

const VALUE_PROPS: { label: string; icon: LucideIcon }[] = [
  { label: "Own your work", icon: Award },
  { label: "Create freely", icon: Pencil },
  { label: "Get rewarded", icon: Trophy },
  { label: "Sign in with a glance", icon: ScanFace },
  { label: "Free to mint", icon: Sparkles },
  { label: "Self custody", icon: KeyRound },
  { label: "Global markets", icon: Globe },
  { label: "Immutable contracts", icon: Lock },
  { label: "Worldwide protection", icon: ShieldCheck },
  { label: "Censorship resistant", icon: Radio },
  { label: "Sponsored transactions", icon: Zap },
  { label: "Remix", icon: Shuffle },
  { label: "Limited editions", icon: Package },
  { label: "Creator's Fund", icon: Gem },
  { label: "Asset provenance", icon: Fingerprint },
  { label: "Creator Launchpad", icon: Rocket },
  { label: "NFT Marketplace", icon: ShoppingBag },
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
