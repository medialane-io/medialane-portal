const ALLOWED_ROUTES: Record<string, RegExp[]> = {
  GET: [
    /^portal\/me$/,
    /^portal\/keys$/,
    /^portal\/credits\/(history|spend)$/,
    /^prices$/,
    /^pricing$/,
    /^collections$/,
    /^auth\/email\/exists$/,
    /^users\/me$/,
    /^intents\/[^/]+$/,
    /^username-claims\/me$/,
    /^username-claims\/check\/[^/]+$/,
    /^tokens\/owned\/[^/]+$/,
    /^activities\/[^/]+$/,
    /^wallet-activity$/,
    /^portal\/runs$/,
    /^portal\/runs\/[^/]+$/,
    /^portal\/runs\/[^/]+\/batches\/[^/]+$/,
  ],

  POST: [
    /^auth\/siws\/(nonce|verify)$/,
    /^auth\/email\/(request-code|verify-code|register-account)$/,
    /^users\/me$/,
    /^users\/me\/(email|wallet|generate-wallet)$/,
    /^portal\/keys$/,
    /^portal\/credits\/check$/,
    /^business\/provisioning$/,
    /^business\/issuance\/emission$/,
    /^intents\/(create-tier|create-collection)$/,
    /^metadata\/upload(-file)?$/,
    /^tx\/sync$/,
    /^username-claims$/,
    /^reports$/,
    /^portal\/runs$/,
    /^portal\/runs\/[^/]+\/(cancel|checkout)$/,
    /^portal\/runs\/[^/]+\/files\/(upload-url|uploaded)$/,
    /^portal\/runs\/[^/]+\/items\/[^/]+\/metadata$/,
    /^portal\/runs\/[^/]+\/batches\/[^/]+\/(build|execute|confirm)$/,
    /^portal\/runs\/[^/]+\/collection\/(build|execute|confirm)$/,
  ],

  PATCH: [/^portal\/runs\/[^/]+$/],

  DELETE: [/^portal\/keys\/[^/]+$/],
};

export function hasTraversalSegment(path: string): boolean {
  return path.split("/").some((segment) => segment === "." || segment === "..");
}

export function isPathAllowed(method: string, path: string): boolean {
  const routes = ALLOWED_ROUTES[method.toUpperCase()];
  if (!routes) return false;
  return routes.some((pattern) => pattern.test(path));
}
