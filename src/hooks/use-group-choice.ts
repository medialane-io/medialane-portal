"use client";

import { useState } from "react";
import { externalLinkProblem, type NewCollectionChoice } from "@/lib/launchpad/collection-choice";
import { useArtwork } from "@/hooks/use-artwork";

interface Picked {
  contractAddress: string;
}

export function useGroupChoice<E, C extends Picked>(toExisting: (picked: C) => E | null) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [existing, setExisting] = useState<{ value: E; address: string } | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const cover = useArtwork();
  const linkProblem = externalLinkProblem(externalLink);

  const choice: E | NewCollectionChoice | null =
    mode === "new"
      ? name.trim() && symbol.trim() && !linkProblem
        ? { kind: "new", name: name.trim(), symbol: symbol.trim().toUpperCase(), description, externalLink, image: cover.artwork }
        : null
      : (existing?.value ?? null);

  return {
    mode,
    setMode,
    name,
    setName,
    symbol,
    setSymbol,
    description,
    setDescription,
    externalLink,
    setExternalLink,
    linkProblem,
    cover,
    choice,
    pickedAddress: existing?.address ?? "",
    pick: (picked: C) => {
      const value = toExisting(picked);
      if (value) setExisting({ value, address: picked.contractAddress });
    },
  };
}
