import { readStringEnv } from "./env";

export { SUPPORTED_TOKENS } from "@medialane/sdk";

const isServer = typeof window === "undefined";

export const MEDIALANE_BACKEND_URL = isServer
  ? readStringEnv(
      process.env.MEDIALANE_API_URL ?? process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL,
      "http://localhost:3001",
    )
  : `${window.location.origin}/api/proxy`;

export const MEDIALANE_API_KEY = isServer
  ? readStringEnv(process.env.MEDIALANE_API_KEY)
  : "";

if (!isServer && MEDIALANE_API_KEY) {
  throw new Error(
    "MEDIALANE_API_KEY is non-empty in the browser bundle — the server-only " +
    "secret may be leaking. Check that no env var with a NEXT_PUBLIC_ prefix " +
    "carries the tenant API key, and that the isServer branch above is intact."
  );
}

export const IPFS_GATEWAY = (() => {
  const configured = process.env.NEXT_PUBLIC_PINATA_GATEWAY?.trim();
  if (!configured) return null;
  const withScheme = configured.startsWith("http") ? configured : `https://${configured}`;
  return withScheme.endsWith("/") ? `${withScheme}ipfs/` : `${withScheme}/ipfs/`;
})();

export const EXPLORER_URL =
  readStringEnv(process.env.NEXT_PUBLIC_EXPLORER_URL, "https://voyager.online");
