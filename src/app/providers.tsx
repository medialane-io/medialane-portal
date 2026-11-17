"use client";

import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NavCommandMenu, NavBrandButton, ThemeAmbientBackground, SelfFundConsentDialog, MedialaneAppProvider } from "@medialane/ui";
import { useAppAdapter } from "@/lib/use-app-adapter";
import { NAV_COMMANDS } from "@/lib/nav-commands";
import { OnboardingGate } from "@/components/wallet/onboarding-gate";
import { NavThemeToggle } from "@medialane/ui/nav-theme-toggle";
import { NavConnectButton } from "@/components/nav-connect-button";
import { HeaderWalletTrigger } from "@/components/nav-wallet-trigger";
import { MediaWalletApp } from "@/components/media-wallet-app";
import { walletConsent } from "@/lib/wallet/client";
import { SiteFooter } from "@/components/site/site-footer";

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

const TECHNICAL_ERROR_RE =
  /\bRPC:|starknet_|-3\d{4}\b|\bunauthorized\b|execution error|\bfelt\b|\bcalldata\b|entry_point|0x[0-9a-f]{6}|[{}]/i;

function toFriendlyToastMessage(err: unknown): string {
  const FALLBACK = "Something went wrong. Please try again in a moment.";
  if (!(err instanceof Error) || !err.message) return FALLBACK;
  const msg = err.message.trim();
  if (msg.length > 140 || TECHNICAL_ERROR_RE.test(msg)) return FALLBACK;
  return msg;
}

function StandaloneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}

function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavCommandMenu
        commands={NAV_COMMANDS}
        footerSlot={<NavThemeToggle />}
        showKeyboardHints={false}
        brandSlot={<NavConnectButton />}
      />
      <MediaWalletApp />
      <div className="relative min-h-screen flex flex-col bg-background">
        <ThemeAmbientBackground imageUrl={null} />
        <div className="fixed top-4 left-4 sm:left-6 lg:left-8 z-50">
          <NavBrandButton />
        </div>
        <div className="fixed top-4 right-4 sm:right-6 lg:right-8 z-50">
          <HeaderWalletTrigger />
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}

function AppAdapter({ children }: { children: React.ReactNode }) {
  return <MedialaneAppProvider value={useAppAdapter()}>{children}</MedialaneAppProvider>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (
    pathname === "/br" || pathname.startsWith("/br/") ||
    pathname === "/mint"
  ) {
    return <StandaloneShell>{children}</StandaloneShell>;
  }
  return <MainShell>{children}</MainShell>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={300}>
      <SWRConfig
        value={{
          onError: (err: unknown) => {

            const status =
              err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number"
                ? (err as { status: number }).status
                : null;

            if (status === 404) return;

            toast.error(toFriendlyToastMessage(err));
          },
        }}
      >
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <AppAdapter>
          <OnboardingGate />
          <Shell>{children}</Shell>
          <SelfFundConsentDialog consent={walletConsent} />
        </AppAdapter>
        <Toaster
          richColors
          position="bottom-center"
          duration={3000}
          gap={4}
          toastOptions={{
            classNames: {
              toast: "rounded-xl shadow-lg border border-border/50 font-sans text-[13px] px-4 py-3",
              title: "font-medium",
              description: "text-xs opacity-70 mt-0.5",
              actionButton: "rounded-lg text-xs font-medium",
              cancelButton: "rounded-lg text-xs",
            },
          }}
        />
      </SWRConfig>
      </TooltipProvider>
    </ThemeProvider>
  );
}
