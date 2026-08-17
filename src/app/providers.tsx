import StarknetProviderWrapper from "./starknet-provider-wrapper";
import { ThemeProvider } from "@/src/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <StarknetProviderWrapper>{children}</StarknetProviderWrapper>
    </ThemeProvider>
  );
}
