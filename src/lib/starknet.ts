import { RpcProvider } from "starknet";
import { MEDIALANE_BACKEND_URL } from "./constants";

const RPC_PROXY_PATH = "/api/rpc";

export function resolveRpcUrl(origin: string | undefined, backendUrl: string): string {
  return origin
    ? `${origin}${RPC_PROXY_PATH}`
    : `${backendUrl.replace(/\/$/, "")}/v1/rpc`;
}

export const RPC_PRIMARY_URL = resolveRpcUrl(
  typeof window === "undefined" ? undefined : window.location.origin,
  MEDIALANE_BACKEND_URL,
);

export const starknetProvider = new RpcProvider({
  nodeUrl: RPC_PRIMARY_URL,
  blockIdentifier: "latest",
});
