import type { WalletToken } from "./wallet-tokens";

export type MediaWalletView =
  | { name: "home"; autoOpenReceive?: boolean }
  | { name: "send"; token?: WalletToken }
  | { name: "token"; token: WalletToken }
  | { name: "activity" };
