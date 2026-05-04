import StarknetProviderWrapper from "./starknet-provider-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StarknetProviderWrapper>{children}</StarknetProviderWrapper>;
}
