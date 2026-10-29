export const ALLOW: Record<string, RegExp[]> = {
  GET: [
    /^portal\/me$/,
    /^portal\/keys$/,
    /^portal\/credits\/history$/,
    /^portal\/funding\/methods$/,
    /^portal\/funding\/[^/]+$/,
    /^prices$/,
    /^pricing$/,
    /^collections$/,
    /^auth\/email\/exists$/,
    /^users\/me$/,
    /^tokens\/owned\/[^/]+$/,
    /^activities\/[^/]+$/,
    /^wallet-activity$/,
    /^portal\/runs$/,
    /^portal\/runs\/[^/]+$/,
    /^portal\/runs\/[^/]+\/batches\/[^/]+$/,
  ],

  POST: [
    /^rpc$/,
    /^paymaster\/(invoke|deploy)\/(build|execute)$/,
    /^intents\/(transfer-token|funding-transfer|wallet-manage)$/,
    /^auth\/email\/(request-code|verify-code)$/,
    /^users\/me$/,
    /^users\/me\/(email|wallet)$/,
    /^portal\/keys$/,
    /^portal\/funding$/,
    /^portal\/funding\/[^/]+\/(challenge|authorize|submit|cancel)$/,
    /^portal\/runs$/,
    /^portal\/runs\/[^/]+\/(cancel|checkout)$/,
    /^portal\/runs\/[^/]+\/files\/(upload-url|uploaded)$/,
    /^portal\/runs\/[^/]+\/items\/[^/]+\/metadata$/,
    /^portal\/runs\/[^/]+\/batches\/[^/]+\/(build|execute|confirm)$/,
    /^portal\/runs\/[^/]+\/collection\/(build|execute|confirm)$/,
    /^portal\/runs\/[^/]+\/(metadata|wallets|wallets\/(resolve|build))$/,
    /^portal\/runs\/[^/]+\/tier\/(build|execute|confirm)$/,
  ],

  PATCH: [/^portal\/runs\/[^/]+$/],

  DELETE: [/^portal\/keys\/[^/]+$/],
};

export function isPathAllowed(method: string, path: string): boolean {
  return (ALLOW[method.toUpperCase()] ?? []).some((re) => re.test(path));
}
