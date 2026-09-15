import { getTokenBySymbol } from "@medialane/sdk";
import { isDeployed as sdkIsDeployed, isValidStarknetAddress, normalizeWalletAddress } from "@medialane/sdk/starknet";
import { walletProvider } from "./provider";

export const norm = normalizeWalletAddress;
export { isValidStarknetAddress };

const tokenAddress = (symbol: string): string => getTokenBySymbol(symbol)!.address;

export const STRK_TOKEN = tokenAddress("STRK");
export const ETH_TOKEN = tokenAddress("ETH");
export const USDC_TOKEN = tokenAddress("USDC");

export const isDeployed = (address: string): Promise<boolean> => sdkIsDeployed(walletProvider(), address);
