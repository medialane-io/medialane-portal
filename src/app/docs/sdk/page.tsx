import React from "react"
import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { DocH2, DocH3, DocCodeBlock } from "@/src/components/docs/typography"

export default function SdkPage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        SDK
      </Badge>
      <h1 className="text-4xl font-extrabold text-white">@medialane/sdk</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Framework-agnostic TypeScript SDK for the Medialane API. Bundles a full REST client and on-chain marketplace helpers in one package.
      </p>

      {/* Install */}
      <DocH2 id="install" border>Install</DocH2>
      <DocCodeBlock lang="bash">{`# bun
bun add @medialane/sdk starknet

# npm
npm install @medialane/sdk starknet

# yarn
yarn add @medialane/sdk starknet`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        Peer dependency: <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">starknet@^6</code>
      </p>

      {/* Configure */}
      <DocH2 id="configure" border>Configure</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        Create a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneClient</code> with your network and API key.
      </p>
      <DocCodeBlock>{`import { MedialaneClient } from "@medialane/sdk"

const client = new MedialaneClient({
  network: "mainnet",        // "mainnet" | "sepolia"
  rpcUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/YOUR_KEY",
  backendUrl: "https://medialane-backend-production.up.railway.app",
  apiKey: "ml_live_YOUR_KEY",
  // marketplaceContract — optional, defaults to mainnet contract
  // collectionContract  — optional, defaults to mainnet collection registry
  // Optional: configure retry for transient failures
  retryOptions: {
    maxAttempts: 3,      // default
    baseDelayMs: 300,    // default
    maxDelayMs: 5000,    // default
  },
})`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        The <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">apiKey</code> is sent as <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> on every request. Get your key at <Link href="/account" className="text-primary hover:underline">/account</Link>.
      </p>

      {/* Minting */}
      <DocH2 id="minting" border>Minting & Launchpad</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        The SDK provides two ways to mint assets: direct on-chain calls (requires signer) and backend-orchestrated intents.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Mint an asset into a collection</h3>
      <DocCodeBlock>{`// 1. Direct on-chain (client.marketplace)
await client.marketplace.mint(account, {
  collectionId: "42",
  recipient: "0x0591...",
  tokenUri: "ipfs://...",
})

// 2. Via backend intent (client.api)
// No SNIP-12 signing required for mint/create-collection intents
const { intentId, calls } = await client.api.createMintIntent({
  owner: "0x0591...", // collection owner
  collectionId: "42",
  recipient: "0x0592...",
  tokenUri: "ipfs://...",
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Register a new collection</h3>
      <DocCodeBlock>{`// 1. Direct on-chain
await client.marketplace.createCollection(account, {
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})

// 2. Via backend intent
const { intentId, calls } = await client.api.createCollectionIntent({
  owner: "0x0591...",
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})`}</DocCodeBlock>

      {/* Marketplace */}
      <DocH2 id="marketplace" border>Marketplace (on-chain)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.marketplace</code> provides typed wrappers for direct contract calls via starknet.js.
      </p>
      <DocCodeBlock>{`// Get order details directly from the contract
const order = await client.marketplace.getOrderDetails("0x04f7a1...")

// Get the current nonce for signing
const nonce = await client.marketplace.getNonce("0x0591...")`}</DocCodeBlock>

      {/* API client */}
      <DocH2 id="api-client" border>API Client (REST)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.api</code> mirrors the full REST API surface.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">List open orders</h3>
      <DocCodeBlock>{`const orders = await client.api.getOrders({ status: "ACTIVE", limit: 20 })

console.log(orders.data[0].orderHash, orders.data[0].price)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Get a token with metadata</h3>
      <DocCodeBlock>{`const token = await client.api.getToken("0x05e7...", "42")

console.log(token.data.metadata?.name)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Get collections by owner</h3>
      <DocCodeBlock>{`// Fetch collections owned by a wallet address
// Addresses are normalized automatically — pass any valid Starknet format
const result = await client.api.getCollectionsByOwner("0x0591...")
result.data.forEach((col) => {
  console.log(col.name, col.collectionId) // collectionId = on-chain registry ID
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Create a listing intent</h3>
      <DocCodeBlock>{`import { toSignatureArray } from "@medialane/sdk"

// 1. Create the intent — get typed data back
const intent = await client.api.createListingIntent({
  nftContract: "0x05e7...",
  tokenId: "42",
  price: "500000",
  currency: "USDC",
  offerer: walletAddress,
  endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
})

// 2. Sign with starknet.js
import { Account } from "starknet"
const account = new Account(provider, walletAddress, privateKey)
const signature = await account.signMessage(intent.data.typedData)

// 3. Submit the signature
await client.api.submitIntentSignature(intent.data.id, toSignatureArray(signature))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Search</h3>
      <DocCodeBlock>{`const results = await client.api.search("genesis", 10)
results.data.tokens.forEach((t) => console.log(t.metadata?.name))
results.data.collections.forEach((c) => console.log(c.name))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Portal — manage keys</h3>
      <DocCodeBlock>{`// List your API keys
const keys = await client.api.getApiKeys()

// Create a new key
const newKey = await client.api.createApiKey("Agent Key")
console.log(newKey.data.key) // shown once — save it!

// Get usage
const usage = await client.api.getUsage()`}</DocCodeBlock>

      <DocH2 id="comments" border>On-chain Comments</DocH2>
      <DocCodeBlock>{`// Fetch permanent on-chain comments for a token
const result = await client.api.getTokenComments("0x05e7...", "42", { limit: 20 })
result.data.forEach((c) => {
  console.log(c.author, c.content, c.postedAt)
})`}</DocCodeBlock>

      <DocH2 id="counter-offers" border>Counter-offers</DocH2>
      <DocCodeBlock>{`// Seller creates a counter-offer in response to a buyer's bid
const intent = await client.api.createCounterOfferIntent(
  {
    sellerAddress: "0x0591...",
    originalOrderHash: "0x04f7a1...",
    counterPrice: "750000",       // raw wei
    durationSeconds: 86400,       // 1 day
    message: "Best I can do!",
  },
  clerkToken
)

// Buyer fetches counter-offers for their bid
const counters = await client.api.getCounterOffers({
  originalOrderHash: "0x04f7a1...",
})
console.log(counters.data[0].price)

// Buyer accepts by fulfilling the counter-offer (it is a standard listing)
await client.api.createFulfillIntent({ fulfiller: buyerAddress, orderHash: counters.data[0].orderHash })`}</DocCodeBlock>

      <DocH2 id="remix-licensing" border>Remix Licensing</DocH2>
      <DocCodeBlock>{`import { OPEN_LICENSES } from "@medialane/sdk"

// Check if a license is open (auto-approved remix)
console.log(OPEN_LICENSES) // ["CC0", "CC BY", "CC BY-SA", "CC BY-NC"]

// Request permission to remix a token (custom offer, Clerk JWT required)
const offer = await client.api.submitRemixOffer(
  {
    originalContract: "0x05e7...",
    originalTokenId: "42",
    licenseType: "CC BY-NC",
    commercial: false,
    derivatives: true,
    royaltyPct: 10,
    message: "Would love to remix this for my EP cover",
  },
  clerkToken
)

// Open-license tokens are auto-approved
const autoOffer = await client.api.submitAutoRemixOffer(
  { originalContract: "0x05e7...", originalTokenId: "7", licenseType: "CC0" },
  clerkToken
)

// Creator approves a pending offer
await client.api.confirmRemixOffer(offer.data.id, {
  approvedCollection: "0x06a3...",
  remixContract: "0x06a3...",
  remixTokenId: "1",
}, clerkToken)

// Creator rejects an offer
await client.api.rejectRemixOffer(offer.data.id, clerkToken)

// Owner records their own self-remix after minting
await client.api.confirmSelfRemix(
  {
    originalContract: "0x05e7...",
    originalTokenId: "42",
    remixContract: "0x06a3...",
    remixTokenId: "1",
    licenseType: "CC BY",
    commercial: true,
    derivatives: true,
  },
  clerkToken
)

// List incoming / outgoing offers
const incoming = await client.api.getRemixOffers({ role: "creator" }, clerkToken)
const outgoing = await client.api.getRemixOffers({ role: "requester" }, clerkToken)

// Get public remixes for a token (no auth needed)
const remixes = await client.api.getTokenRemixes("0x05e7...", "42")
remixes.data.forEach((r) => console.log(r.remixContract, r.remixTokenId, r.licenseType))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">CollectionSort — typed sort options</h3>
      <DocCodeBlock>{`import type { CollectionSort } from "@medialane/sdk"

// "recent" | "supply" | "floor" | "volume" | "name"
const sort: CollectionSort = "floor"
await client.api.getCollections(1, 20, true, sort)`}</DocCodeBlock>

      {/* POP Protocol */}
      <DocH2 id="pop-protocol" border>POP Protocol (Proof of Participation)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        POP collections are event-based claim drops — conferences, workshops, hackathons, bootcamps. Each collection has one claimable token per eligible wallet. Use <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.services.pop</code> for on-chain interactions and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.api</code> for eligibility checks.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Check eligibility and claim</h3>
      <DocCodeBlock>{`// Check if a wallet is eligible to claim from a POP collection
const status = await client.api.getPopEligibility(
  "0x00b32c...",   // POP collection address
  "0x0591...",     // wallet address
)
// status: { isEligible: boolean; hasClaimed: boolean; tokenId: string | null }

if (status.isEligible && !status.hasClaimed) {
  // Claim on-chain (requires starknet.js AccountInterface)
  const { txHash } = await client.services.pop.claim(account, "0x00b32c...")
  console.log("Claimed:", txHash)
}`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Batch eligibility check</h3>
      <DocCodeBlock>{`// Check up to 100 wallets in one request
const results = await client.api.getPopEligibilityBatch(
  "0x00b32c...",          // POP collection address
  ["0x0591...", "0x06a3..."],
)
// results: Array<{ wallet, isEligible, hasClaimed, tokenId }>
results.forEach((r) => console.log(r.wallet, r.isEligible))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">List POP collections</h3>
      <DocCodeBlock>{`// Fetch all POP Protocol collections
const pops = await client.api.getPopCollections({ page: 1, limit: 20, sort: "recent" })
pops.data.forEach((col) => console.log(col.name, col.source)) // source: "POP_PROTOCOL"`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Admin — mint and allowlist</h3>
      <DocCodeBlock>{`// Gift a token to a specific wallet (bypass eligibility check)
await client.services.pop.adminMint(account, {
  collection: "0x00b32c...",
  recipient: "0x0591...",
  customUri: "ipfs://...",  // optional override
})

// Add a single wallet to the allowlist
await client.services.pop.addToAllowlist(account, {
  collection: "0x00b32c...",
  address: "0x0591...",
})

// Add up to 200 wallets per tx
await client.services.pop.batchAddToAllowlist(account, {
  collection: "0x00b32c...",
  addresses: ["0x0591...", "0x06a3...", /* ... */],
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Deploy a new POP collection</h3>
      <DocCodeBlock>{`import type { CreatePopCollectionParams } from "@medialane/sdk"

const params: CreatePopCollectionParams = {
  name: "ETHDenver 2026",
  symbol: "ETHDEN26",
  baseUri: "ipfs://...",
  claimEndTime: Math.floor(Date.now() / 1000) + 86400 * 7,  // 7 days
  eventType: "Conference",  // "Conference" | "Bootcamp" | "Workshop" | "Hackathon" | "Meetup" | "Course" | "Other"
}
const { txHash } = await client.services.pop.createCollection(account, params)
console.log("Deployed:", txHash)`}</DocCodeBlock>

      {/* Collection Drop */}
      <DocH2 id="collection-drop" border>Collection Drop</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        Collection Drops are public minting campaigns with configurable claim conditions — price, supply cap, time window, and per-wallet limits. Use <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.services.drop</code> for on-chain interactions and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.api</code> for status queries.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Claim (public mint)</h3>
      <DocCodeBlock>{`// Check mint status for a wallet before claiming
const status = await client.api.getDropMintStatus(
  "0x03587f...",   // Drop collection address
  "0x0591...",     // wallet address
)
// status: { mintedByWallet: number; totalMinted: number }

// Claim 1 token (default)
const { txHash } = await client.services.drop.claim(account, "0x03587f...")

// Claim multiple tokens
await client.services.drop.claim(account, "0x03587f...", 3)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">List Drop collections</h3>
      <DocCodeBlock>{`const drops = await client.api.getDropCollections({ page: 1, limit: 20, sort: "recent" })
drops.data.forEach((col) => console.log(col.name, col.source)) // source: "COLLECTION_DROP"`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Deploy a new Drop</h3>
      <DocCodeBlock>{`import type { CreateDropParams, ClaimConditions } from "@medialane/sdk"

const conditions: ClaimConditions = {
  startTime: Math.floor(Date.now() / 1000),          // open now
  endTime: Math.floor(Date.now() / 1000) + 86400 * 30, // closes in 30 days
  price: BigInt("1000000"),                           // 1 USDC (6 decimals). 0 = free mint
  paymentToken: "0x033068f6...",                      // USDC contract
  maxQuantityPerWallet: BigInt(5),                    // max 5 per wallet. 0 = unlimited
}

const params: CreateDropParams = {
  name: "Genesis Drop",
  symbol: "GEN",
  baseUri: "ipfs://...",
  maxSupply: BigInt(1000),
  initialConditions: conditions,
}
const { txHash } = await client.services.drop.createDrop(account, params)
console.log("Drop deployed:", txHash)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Manage an active Drop</h3>
      <DocCodeBlock>{`// Update claim conditions (price, time window, wallet limits)
await client.services.drop.setClaimConditions(account, {
  collection: "0x03587f...",
  conditions: { startTime: 0, endTime: 0, price: 0n, paymentToken: "0x0", maxQuantityPerWallet: 0n },
})

// Pause or unpause minting
await client.services.drop.setPaused(account, { collection: "0x03587f...", paused: true })

// Enable allowlist gate
await client.services.drop.setAllowlistEnabled(account, { collection: "0x03587f...", enabled: true })
await client.services.drop.batchAddToAllowlist(account, {
  collection: "0x03587f...",
  addresses: ["0x0591...", "0x06a3..."],
})

// Withdraw ERC-20 proceeds
await client.services.drop.withdrawPayments(account, { collection: "0x03587f..." })`}</DocCodeBlock>

      {/* Error Handling */}
      <DocH2 id="errors" border>Error Handling</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        The SDK throws <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneError</code> for marketplace issues and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneApiError</code> for REST API failures. Both carry a typed <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">.code</code> field from the <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneErrorCode</code> union.
      </p>
      <DocCodeBlock>{`import { MedialaneError, MedialaneApiError } from "@medialane/sdk"

try {
  await client.marketplace.mint(account, params)
} catch (err) {
  if (err instanceof MedialaneError) {
    console.error(err.code, err.message) // e.g. "TRANSACTION_FAILED"
  }
  if (err instanceof MedialaneApiError) {
    console.error(err.code, err.status, err.message) // e.g. "TOKEN_NOT_FOUND", 404
  }
}`}</DocCodeBlock>

      <DocH2 id="error-codes" border>Error Codes</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        All errors expose a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneErrorCode</code> typed union:
      </p>
      <DocCodeBlock>{`type MedialaneErrorCode =
  | "TOKEN_NOT_FOUND"
  | "COLLECTION_NOT_FOUND"
  | "ORDER_NOT_FOUND"
  | "INTENT_NOT_FOUND"
  | "INTENT_EXPIRED"
  | "RATE_LIMITED"
  | "NETWORK_NOT_SUPPORTED"
  | "APPROVAL_FAILED"
  | "TRANSACTION_FAILED"
  | "INVALID_PARAMS"
  | "UNAUTHORIZED"
  | "UNKNOWN"`}</DocCodeBlock>

      <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr] text-xs">
          <div className="grid grid-cols-subgrid col-span-2 bg-white/5 border-b border-white/10 px-4 py-2 font-semibold text-white">
            <span>Code</span>
            <span>Trigger</span>
          </div>
          {[
            ["TOKEN_NOT_FOUND", "404 response or missing token"],
            ["COLLECTION_NOT_FOUND", "404 on collection lookup"],
            ["ORDER_NOT_FOUND", "404 on order lookup"],
            ["INTENT_NOT_FOUND", "404 on intent lookup"],
            ["INTENT_EXPIRED", "410 response — intent TTL exceeded"],
            ["RATE_LIMITED", "429 response — too many requests"],
            ["NETWORK_NOT_SUPPORTED", "Sepolia selected with no contract addresses"],
            ["APPROVAL_FAILED", "NFT approval missing before listing"],
            ["TRANSACTION_FAILED", "On-chain call reverted"],
            ["INVALID_PARAMS", "400 response — bad request parameters"],
            ["UNAUTHORIZED", "401/403 — missing or invalid API key"],
            ["UNKNOWN", "Unexpected errors"],
          ].map(([code, trigger], i, arr) => (
            <div key={code} className={`grid grid-cols-subgrid col-span-2 px-4 py-2.5 items-start ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
              <code className="font-mono text-primary whitespace-nowrap mr-6">{code}</code>
              <span className="text-muted-foreground">{trigger}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3">
        Note: 4xx errors are <span className="text-white font-medium">not retried</span> automatically. Only transient network and 5xx errors trigger the retry logic configured via <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">retryOptions</code>.
      </p>

      <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-white">Full API reference</span> — all REST endpoints, parameters, and response schemas are documented in the{" "}
          <Link href="/docs/api" className="text-primary hover:underline">API Reference</Link>.
        </p>
      </div>

      {/* Use case examples */}
      <DocH2 id="examples" border>Use Case Examples</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        Common patterns you can build with the SDK:
      </p>

      <DocH3>Fetch a creator&apos;s portfolio</DocH3>
      <DocCodeBlock lang="ts">{`const portfolio = await client.api.getTokensByOwner({
  owner: "0x05f9...",
  limit: 20,
});
// portfolio.data → array of token objects with metadata, license terms, remixCount`}</DocCodeBlock>

      <DocH3>List open-license assets for remix</DocH3>
      <DocCodeBlock lang="ts">{`import { OPEN_LICENSES } from "@medialane/sdk";

const openAssets = await client.api.getTokens({
  licenseType: OPEN_LICENSES, // ["CC0", "CC BY", "CC BY-SA", "CC BY-NC"]
});`}</DocCodeBlock>

      <DocH3>Submit a trade intent (no private key exposure)</DocH3>
      <DocCodeBlock lang="ts">{`const intent = await client.api.createListingIntent({
  contractAddress: "0x04a...",
  tokenId: "42",
  price: "0.05",       // in ETH
  currency: "ETH",
  duration: 86400,     // seconds
});

// sign off-chain, submit on-chain
const sig = await account.signMessage(intent.typedData);
await client.api.submitOrder({ ...intent, signature: sig });`}</DocCodeBlock>

      <DocH3>Stream on-chain activity</DocH3>
      <DocCodeBlock lang="ts">{`const activity = await client.api.getActivities({
  eventType: "TRANSFER",   // TRANSFER | ORDER_CREATED | ORDER_FULFILLED | ORDER_CANCELLED
  contractAddress: "0x04a...",
  limit: 50,
});`}</DocCodeBlock>

      <DocH2 id="consumer-apps" border>Built with the SDK</DocH2>
      <p className="text-muted-foreground text-sm mb-4">
        Both Medialane consumer apps use the same SDK you&apos;re integrating:
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
          <p className="text-xs font-mono text-muted-foreground">medialane.io</p>
          <p className="text-sm font-semibold text-white">Creator Launchpad</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Collections, Orders, Minting, Remix Licensing, POP, Collection Drop, On-chain Comments.
            Invisible wallet UX via ChipiPay.
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-2">
          <p className="text-xs font-mono text-muted-foreground">dapp.medialane.io</p>
          <p className="text-sm font-semibold text-white">Permissionless dApp</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Activities, Trade Intents, Asset Metadata. Direct starknet.js reads — no backend dependency for browsing.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
        <p className="text-sm font-semibold text-white">Full SDK documentation</p>
        <p className="text-sm text-muted-foreground">
          Complete method reference, type definitions, and advanced usage are on{" "}
          <a href="https://docs.medialane.io/docs/sdk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            docs.medialane.io/docs/sdk
          </a>
          .
        </p>
      </div>
    </div >
  )
}
