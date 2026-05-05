import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { DocH2, DocH3, DocCodeBlock } from "@/src/components/docs/typography"

export default function AgentsPage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        Agents
      </Badge>

      <h1 className="text-4xl font-extrabold text-white leading-tight">
        Agent Quickstart
      </h1>

      <p className="text-muted-foreground text-lg mt-2 mb-8">
        Medialane is built to be consumed by autonomous AI agents. Wallet keypair identity, on-chain payments, and machine-readable 402 billing make it a natural fit for agent workflows.
      </p>

      {/* Why agents */}
      <DocH2 id="why">Why agents work here</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        Traditional API platforms require email, OAuth, or credit-card billing — all designed for humans. Medialane uses permissionless primitives instead:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc list-inside">
        <li><strong className="text-white">Identity</strong> — a Starknet wallet keypair. No email, no OAuth provider, no third-party dependency.</li>
        <li><strong className="text-white">Auth</strong> — Sign-In with Starknet (SIWS). Sign a typed-data challenge, receive a short-lived JWT.</li>
        <li><strong className="text-white">Billing</strong> — USDC on Starknet. Deposit on-chain, credits settle within ~2 minutes.</li>
        <li><strong className="text-white">Access gate</strong> — 500 MDLN minimum in the agent wallet to provision an API key. Tokens stay in the wallet.</li>
        <li><strong className="text-white">Credit exhaustion</strong> — machine-readable <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">402</code> with <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining</code> header, not a human-facing error page.</li>
      </ul>

      {/* SIWS */}
      <DocH2 id="siws">SIWS Authentication</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        Agents authenticate the same way a browser wallet does — by signing a typed-data challenge. Use <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">starknet.js</code> with a local keypair:
      </p>

      <DocH3>1. Fetch challenge</DocH3>
      <DocCodeBlock lang="ts">{`import { RpcProvider, Account, ec, stark } from "starknet";

const address = process.env.AGENT_WALLET_ADDRESS!;
const privateKey = process.env.AGENT_PRIVATE_KEY!;

const res = await fetch(
  \`https://portal.medialane.io/api/auth/challenge?address=\${address}\`
);
const { nonce } = await res.json();`}</DocCodeBlock>

      <DocH3>2. Sign the typed-data challenge</DocH3>
      <DocCodeBlock lang="ts">{`const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
const account = new Account(provider, address, privateKey);

// The same typed-data domain the portal uses
const typedData = {
  types: {
    StarkNetDomain: [
      { name: "name", type: "felt" },
      { name: "version", type: "felt" },
      { name: "chainId", type: "felt" },
    ],
    Message: [
      { name: "nonce", type: "felt" },
      { name: "address", type: "felt" },
    ],
  },
  primaryType: "Message",
  domain: { name: "Medialane Portal", version: "1", chainId: "SN_MAIN" },
  message: { nonce, address },
};

const signature = await account.signMessage(typedData);`}</DocCodeBlock>

      <DocH3>3. Exchange for JWT</DocH3>
      <DocCodeBlock lang="ts">{`const verifyRes = await fetch("https://portal.medialane.io/api/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ address, nonce, signature }),
  credentials: "include",  // stores auth-token + auth-refresh cookies
});

// JWT is set as an HttpOnly cookie automatically.
// For headless agents, extract from Set-Cookie if needed.`}</DocCodeBlock>

      {/* API Key */}
      <DocH2 id="api-key">Get an API Key</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        After authenticating, provision your wallet and create an API key via the portal API. Keys are tied to the wallet address, not an email account.
      </p>
      <DocCodeBlock lang="ts">{`// Provision wallet (idempotent — safe to call on every boot)
await fetch("https://portal.medialane.io/api/portal/provision", {
  method: "POST",
  credentials: "include",
});

// Create an API key
const keyRes = await fetch("https://portal.medialane.io/api/portal/keys", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "agent-key" }),
  credentials: "include",
});
const { key } = await keyRes.json();
// store key securely — shown only once`}</DocCodeBlock>

      {/* Credit billing */}
      <DocH2 id="billing">Credit Billing — Handling 402</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        Every response includes an <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining</code> header.
        When credits reach zero the API returns <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code>.
        Detect and handle it programmatically:
      </p>
      <DocCodeBlock lang="ts">{`async function apiCall(endpoint: string) {
  const res = await fetch(
    \`https://medialane-backend-production.up.railway.app\${endpoint}\`,
    { headers: { "x-api-key": process.env.ML_API_KEY! } }
  );

  const remaining = Number(res.headers.get("X-Credits-Remaining") ?? 0);
  if (remaining < 10) {
    console.warn(\`Low credits: \${remaining} remaining\`);
  }

  if (res.status === 402) {
    // Credits exhausted — trigger top-up before retrying
    await topUpCredits();
    return apiCall(endpoint);  // retry once
  }

  return res.json();
}`}</DocCodeBlock>

      {/* Autonomous top-up */}
      <DocH2 id="topup">Autonomous USDC Top-up</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        Agents can top up credits autonomously by sending USDC to the treasury address on Starknet.
        Credits appear within ~2 minutes (one Vercel cron cycle).
      </p>
      <DocCodeBlock lang="ts">{`import { Account, RpcProvider, Contract } from "starknet";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;

async function topUpCredits(usdcAmount = 5) {
  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  const account = new Account(provider, process.env.AGENT_WALLET_ADDRESS!, process.env.AGENT_PRIVATE_KEY!);

  // USDC has 6 decimals
  const amount = BigInt(usdcAmount * 1_000_000);

  await account.execute([{
    contractAddress: USDC_CONTRACT,
    entrypoint: "transfer",
    calldata: [TREASURY, amount.toString(), "0"],
  }]);

  // Poll until credits arrive (typically < 2 min)
  await waitForCredits();
}

async function waitForCredits(retries = 20, delayMs = 7_000) {
  for (let i = 0; i < retries; i++) {
    await new Promise(r => setTimeout(r, delayMs));
    const res = await fetch("https://portal.medialane.io/api/credits/balance", {
      credentials: "include",
    });
    const { balance } = await res.json();
    if (balance > 0) return;
  }
  throw new Error("Credits did not appear after 2 minutes");
}`}</DocCodeBlock>

      {/* MDLN tip */}
      <DocH2 id="mdln">MDLN Token Multipliers</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        If your agent wallet holds MDLN tokens, the multiplier is applied automatically at deposit time — no configuration required.
        The on-chain balance is read at the moment the deposit transaction is detected.
      </p>
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02] text-sm">
        <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>MDLN Balance</span>
          <span className="text-center">Multiplier</span>
          <span className="text-center">Credits per $1 USDC</span>
        </div>
        {[
          ["0 MDLN", "1.0×", "100"],
          ["500+ MDLN", "1.2×", "120"],
          ["2,000+ MDLN", "1.5×", "150"],
          ["5,000+ MDLN", "2.0×", "200"],
        ].map(([range, mult, credits], i, arr) => (
          <div key={range} className={`grid grid-cols-3 px-5 py-3 items-center ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="text-muted-foreground">{range}</span>
            <span className="text-center text-white font-medium">{mult}</span>
            <span className="text-center text-primary font-medium">{credits}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Learn more about MDLN at{" "}
        <a href="https://medialane.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
          medialane.org
        </a>. Hold MDLN in the same wallet you use as your agent identity.
      </p>

      {/* Next steps */}
      <DocH2 id="next">Next Steps</DocH2>
      <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
        <li><Link href="/docs/api" className="text-primary hover:underline">API Reference</Link> — all available endpoints</li>
        <li><Link href="/docs/sdk" className="text-primary hover:underline">SDK Docs</Link> — typed TypeScript client (@medialane/sdk)</li>
        <li><Link href="/integrate" className="text-primary hover:underline">Integrate</Link> — credit costs and MDLN tier details</li>
      </ul>
    </div>
  )
}
