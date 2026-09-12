"use client";

import { useState } from "react";
import type { MediaWalletView } from "./types";
import { MediaWalletHome } from "./media-wallet-home";
import { MediaWalletSend } from "./media-wallet-send";
import { MediaWalletTokenDetail } from "./media-wallet-token-detail";
import { MediaWalletActivity } from "./media-wallet-activity";

export function MediaWallet({
  onClose,
  initialView,
}: {
  onClose: () => void;
  initialView?: MediaWalletView;
}) {
  const [view, setView] = useState<MediaWalletView>(initialView ?? { name: "home" });

  switch (view.name) {
    case "home":
      return <MediaWalletHome onNavigate={setView} onClose={onClose} autoOpenReceive={view.autoOpenReceive} />;
    case "send":
      return <MediaWalletSend initialToken={view.token} onNavigate={setView} onDone={() => setView({ name: "home" })} />;
    case "token":
      return <MediaWalletTokenDetail token={view.token} onNavigate={setView} />;
    case "activity":
      return <MediaWalletActivity onNavigate={setView} />;
  }
}
