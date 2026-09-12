"use client";

import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { MedialaneLogo } from "@/components/brand/medialane-logo";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NavCommandMenu, NavBrandButton, ThemeAmbientBackground } from "@medialane/ui";
import { NAV_COMMANDS } from "@/lib/nav-commands";
import { AccountSyncOnLogin } from "@/components/shared/account-sync-on-login";
import { UndeployedWalletRedirect } from "@/components/wallet/undeployed-wallet-redirect";
import { EmailRequiredRedirect } from "@/components/wallet/email-required-redirect";
import { NavThemeToggle } from "@/components/nav-theme-toggle";
import { NavConnectButton } from "@/components/nav-connect-button";
import { HeaderWalletTrigger } from "@/components/nav-wallet-trigger";
import { MediaWalletOverlay } from "@/components/media-wallet/media-wallet-overlay";
import { SelfFundConsentDialog } from "@/components/wallet/self-fund-consent-dialog";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useCreatorProfile } from "@/hooks/use-profiles";
import { WalletNotDeployedError } from "@/hooks/use-siws-token";
import { resolveTokenImage } from "@/lib/utils";

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
  const pathname = usePathname();
  const suppressAmbient =
    pathname.startsWith("/asset/") ||
    pathname.startsWith("/collections/") ||
    pathname.startsWith("/creator/");
  const { address: walletAddress } = useWalletNativeSession();
  const { profile } = useCreatorProfile(walletAddress ?? undefined);
  const themeImageUrl = suppressAmbient ? null : resolveTokenImage(profile?.avatarImage);

  return (
    <>
      <NavCommandMenu
        commands={NAV_COMMANDS}
        footerSlot={<NavThemeToggle />}
        showKeyboardHints={false}
        brandSlot={<NavConnectButton />}
      />
      <MediaWalletOverlay />
      <div className="relative min-h-screen flex flex-col bg-background">
        <ThemeAmbientBackground imageUrl={themeImageUrl} />
        <div className="fixed top-4 left-4 sm:left-6 lg:left-8 z-50">
          <NavBrandButton />
        </div>
        <div className="fixed top-4 right-4 sm:right-6 lg:right-8 z-50">
          <HeaderWalletTrigger />
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        <footer className="px-4 sm:px-6 lg:px-8 py-8 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-xs">© {new Date().getFullYear()} Medialane DAO</p>
            <nav className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/marketplace" className="hover:text-foreground transition-colors">Trade</Link>
              <Link href="/launchpad" className="hover:text-foreground transition-colors">Launch</Link>
              <a href="https://docs.medialane.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Docs</a>
              <a href="https://docs.medialane.io/guidelines/terms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Terms</a>
              <a href="https://docs.medialane.io/guidelines/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="https://x.com/medialane_io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">X</a>
            </nav>
            <div className="flex items-center gap-2">
              <MedialaneLogo />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
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
            if (status === 401 || status === 403) return;

            if (status === 404) return;

            if (err instanceof WalletNotDeployedError) return;

            toast.error(toFriendlyToastMessage(err));
          },
        }}
      >
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <AccountSyncOnLogin />
        <UndeployedWalletRedirect />
        <EmailRequiredRedirect />
        <Shell>{children}</Shell>
        <SelfFundConsentDialog />
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
