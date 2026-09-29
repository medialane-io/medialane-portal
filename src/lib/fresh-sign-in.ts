export interface FreshSignInDeps {
  /** The sign-in already stored on this device, if any. */
  getToken: () => string | null;
  /** Asks the person to confirm with their passkey and returns a brand-new sign-in, or null if they did not. */
  signIn: () => Promise<string | null>;
}

/**
 * For actions the server only allows with a recent sign-in (changing API keys, for one). The stored
 * sign-in is tried first. If the server says it is too old, the person is asked to confirm and the
 * request is made once more with the fresh one. It never retries more than once, and never for any
 * other kind of 401, where a new sign-in would not help.
 */
export async function withFreshSignIn(
  request: (token: string | null) => Promise<Response>,
  deps: FreshSignInDeps,
): Promise<Response> {
  const first = await request(deps.getToken());
  if (first.status !== 401) return first;

  const body = (await first.clone().json().catch(() => null)) as { error?: string } | null;
  if (body?.error !== "stale_signature") return first;

  const fresh = await deps.signIn();
  if (!fresh) return first;
  return request(fresh);
}
