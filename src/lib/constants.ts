export const CREDITS_PER_USDC = 100;

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://voyager.online";

// ── Starknet RPC — two role-based, SERVER-ONLY vars ─────────────────────────
// Browser never sees a keyed URL — it talks to the same-origin /api/rpc proxy
// (src/app/api/rpc/route.ts), which forwards to MAIN server-side. Mirrors
// medialane-starknet's src/lib/constants.ts after its 2026-06-23 key-leak fix;
// do NOT reintroduce a NEXT_PUBLIC_ keyed URL here.
export const RPC_MAIN_URL = process.env.STARKNET_RPC_URL ?? "";
export const RPC_FALLBACK_URL =
  process.env.STARKNET_RPC_FALLBACK_URL || "https://rpc.starknet.lava.build";
export const RPC_PROXY_PATH = "/api/rpc";
