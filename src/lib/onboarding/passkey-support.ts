export type PasskeySupport = "available" | "unavailable" | "unknown";

interface PlatformPasskeyApi {
  isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
}

export async function detectPasskeySupport(
  api: PlatformPasskeyApi | undefined = typeof PublicKeyCredential === "undefined" ? undefined : PublicKeyCredential,
): Promise<PasskeySupport> {
  if (!api) return "unavailable";
  if (typeof api.isUserVerifyingPlatformAuthenticatorAvailable !== "function") return "unknown";
  try {
    return (await api.isUserVerifyingPlatformAuthenticatorAvailable()) ? "available" : "unavailable";
  } catch {
    return "unknown";
  }
}
