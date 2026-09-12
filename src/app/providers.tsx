"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { Toaster, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";

const TECHNICAL_ERROR = /\bRPC:|starknet_|-3\d{4}\b|\bunauthorized\b|execution error|\bfelt\b|\bcalldata\b|entry_point|0x[0-9a-f]{6}|[{}]/i;

function friendly(err: unknown): string {
  const fallback = "Something went wrong. Please try again in a moment.";
  if (!(err instanceof Error) || !err.message) return fallback;
  const message = err.message.trim();
  return message.length > 140 || TECHNICAL_ERROR.test(message) ? fallback : message;
}

function statusOf(err: unknown): number | null {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={300}>
        <SWRConfig
          value={{
            onError: (err: unknown) => {
              const status = statusOf(err);
              if (status === 401 || status === 403 || status === 404) return;
              toast.error(friendly(err));
            },
          }}
        >
          <div className="flex min-h-screen flex-col bg-background">
            <Nav />
            <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors position="bottom-center" duration={3000} gap={4} />
        </SWRConfig>
      </TooltipProvider>
    </ThemeProvider>
  );
}
