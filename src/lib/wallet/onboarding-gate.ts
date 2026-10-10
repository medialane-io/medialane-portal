export interface OnboardingGateState {
  pathname: string;
  hasWallet: boolean;
  isDeployed: boolean | null;
  isDeploying: boolean;
}

const GATED_PREFIXES = ["/account", "/launchpad"];

const onAny = (pathname: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const withReturnTo = (target: string, pathname: string): string =>
  `${target}?redirect_url=${encodeURIComponent(pathname)}`;

export function resolveOnboardingRedirect(state: OnboardingGateState): string | null {
  const { pathname, hasWallet, isDeployed, isDeploying } = state;
  if (!hasWallet || !onAny(pathname, GATED_PREFIXES)) return null;

  if (isDeployed === false && !isDeploying) return withReturnTo("/wallet-onboarding", pathname);

  return null;
}
