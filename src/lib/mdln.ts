import { RpcProvider, Contract, uint256 } from "starknet";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [{ name: "balance", type: "core::integer::u256" }],
    state_mutability: "view",
  },
] as const;

export type MdlnTier = 0 | 1 | 2 | 3;

export function getTier(balance: bigint): MdlnTier {
  if (balance >= 5000n * 10n ** 18n) return 3;
  if (balance >= 2000n * 10n ** 18n) return 2;
  if (balance >= 500n * 10n ** 18n) return 1;
  return 0;
}

export function getMultiplier(tier: MdlnTier): number {
  return [1.0, 1.2, 1.5, 2.0][tier];
}

export async function getMdlnBalance(walletAddress: string): Promise<bigint> {
  const contractAddress = process.env.MDLN_CONTRACT_ADDRESS;
  const rpcUrl = process.env.STARKNET_RPC_URL;

  if (!contractAddress || !rpcUrl) return 0n;

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const contract = new Contract(ERC20_ABI as any, contractAddress, provider);

  try {
    const result = await contract.balanceOf(walletAddress);
    return uint256.uint256ToBN({ low: result.low ?? result.balance?.low ?? 0n, high: result.high ?? result.balance?.high ?? 0n });
  } catch {
    return 0n;
  }
}
