
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "decimals", type: "felt" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "symbol", type: "felt" }],
    stateMutability: "view",
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ name: "name", type: "felt" }],
    stateMutability: "view",
  },
] as const;
