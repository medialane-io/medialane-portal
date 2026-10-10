export const SESSION_COOKIE_NAME = "ml_account_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function shouldSetSessionCookie(path: string, method: string): boolean {
  return (
    method === "POST" &&
    path === "auth/email/verify-code"
  );
}

export function extractAccountToken(bodyText: string): string | null {
  try {
    const data = JSON.parse(bodyText) as { accountToken?: unknown };
    return typeof data.accountToken === "string" ? data.accountToken : null;
  } catch {
    return null;
  }
}

export function stripAccountToken(bodyText: string): string {
  try {
    const data = JSON.parse(bodyText) as Record<string, unknown>;
    if (!("accountToken" in data)) return bodyText;
    delete data.accountToken;
    return JSON.stringify(data);
  } catch {
    return bodyText;
  }
}

export function shouldAuthorizeWithSession(path: string): boolean {
  return path === "portal" || path.startsWith("portal/");
}
