import { ArgentX } from "starknetkit/argentX";
import { Braavos } from "starknetkit/braavos";
import { MetaMask } from "starknetkit/metamask";
import { Keplr } from "starknetkit/keplr";
import { Fordefi } from "starknetkit/fordefi";
import { Xverse } from "starknetkit/xverse";
import type { Connector } from "@starknet-react/core";

const SUPPORTED_WALLETS: { connector: Connector; installUrl?: string }[] = [
  { connector: new ArgentX(), installUrl: "https://www.ready.co/download" },
  { connector: new Braavos(), installUrl: "https://braavos.app/download-braavos-wallet/" },
  { connector: new MetaMask(), installUrl: "https://metamask.io/download/" },
  { connector: new Keplr(), installUrl: "https://www.keplr.app/download" },
  { connector: new Fordefi() },
  { connector: new Xverse(), installUrl: "https://www.xverse.app/download" },
];

export const walletConnectors: Connector[] = SUPPORTED_WALLETS.map((w) => w.connector);

export const WALLET_INSTALL_URLS: Record<string, string> = Object.fromEntries(
  SUPPORTED_WALLETS.filter((w) => w.installUrl).map((w) => [w.connector.id, w.installUrl!]),
);

type ConnectorIconObj = { dark?: string; light?: string };

export function getConnectorIconSrc(icon: ConnectorIconObj | string | undefined): string | undefined {
  if (!icon) return undefined;
  if (typeof icon === "string") return icon;
  return icon.dark ?? icon.light;
}
