"use client";

import { useState } from "react";

export interface NewGroup {
  kind: "new";
  name: string;
  symbol: string;
}

interface Picked {
  contractAddress: string;
}

export function useGroupChoice<E, C extends Picked>(toExisting: (picked: C) => E | null) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [existing, setExisting] = useState<{ value: E; address: string } | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const choice: E | NewGroup | null =
    mode === "new"
      ? name.trim() && symbol.trim()
        ? { kind: "new", name: name.trim(), symbol: symbol.trim().toUpperCase() }
        : null
      : (existing?.value ?? null);

  return {
    mode,
    setMode,
    name,
    setName,
    symbol,
    setSymbol,
    choice,
    pickedAddress: existing?.address ?? "",
    pick: (picked: C) => {
      const value = toExisting(picked);
      if (value) setExisting({ value, address: picked.contractAddress });
    },
  };
}
