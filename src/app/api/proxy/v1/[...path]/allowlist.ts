const ALLOWED_ROUTES: Record<string, RegExp[]> = {
  GET: [
    /^portal\/me$/,
    /^portal\/keys$/,
    /^portal\/credits\/(history|spend)$/,
    /^prices$/,
    /^collections$/,
    /^auth\/email\/exists$/,
    /^users\/me$/,
    /^intents\/[^/]+$/,
    /^username-claims\/me$/,
    /^username-claims\/check\/[^/]+$/,
  ],

  POST: [
    /^auth\/siws\/(nonce|verify)$/,
    /^auth\/email\/(request-code|verify-code|register-account)$/,
    /^users\/me\/(email|wallet|generate-wallet)$/,
    /^portal\/keys$/,
    /^portal\/credits\/check$/,
    /^business\/launchpad\/(quote|runs)$/,
    /^business\/provisioning$/,
    /^business\/issuance\/mint-calls$/,
    /^intents\/(create-tier|create-collection)$/,
    /^metadata\/upload(-file)?$/,
    /^tx\/sync$/,
    /^username-claims$/,
    /^reports$/,
  ],

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
