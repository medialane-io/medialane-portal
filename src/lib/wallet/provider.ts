import { RpcProvider } from "starknet";

export function walletProvider(): RpcProvider {
  return new RpcProvider({ nodeUrl: "/api/proxy/v1/rpc" });
}
