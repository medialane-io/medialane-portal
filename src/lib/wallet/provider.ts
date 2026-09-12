import { RpcProvider } from "starknet";

export function walletProvider(): RpcProvider {
  return new RpcProvider({ nodeUrl: "/api/rpc" });
}
