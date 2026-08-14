export const CREDITS_PER_USDC = 100;

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://voyager.online";

export const RPC_MAIN_URL = process.env.STARKNET_RPC_URL ?? "";
export const RPC_FALLBACK_URL =
  process.env.STARKNET_RPC_FALLBACK_URL || "https://rpc.starknet.lava.build";
export const RPC_PROXY_PATH = "/api/rpc";
