import { validateAndParseAddress } from "starknet";
import { normalizeAddress, getTokenBySymbol } from "@medialane/sdk";
import { walletProvider } from "./provider";

export const norm = (address: string): string => normalizeAddress("STARKNET", address);

export function isValidStarknetAddress(address: string): boolean {
  try {
    validateAndParseAddress(address.trim());
    return true;
  } catch {
    return false;
  }
}

const tokenAddress = (symbol: string): string => getTokenBySymbol(symbol)!.address;

export const STRK_TOKEN = tokenAddress("STRK");
export const ETH_TOKEN = tokenAddress("ETH");
export const USDC_TOKEN = tokenAddress("USDC");

export async function isDeployed(address: string): Promise<boolean> {
  try {
    await walletProvider().getClassHashAt(norm(address));
    return true;
  } catch {
    return false;
  }
}
