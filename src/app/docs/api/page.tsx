import React from "react"
import { Badge } from "@/src/components/ui/badge"
import { DocH2, DocCodeBlock } from "@/src/components/docs/typography"

function MethodBadge({ method }: { method: "GET" | "POST" | "PATCH" | "DELETE" }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/15 text-green-300 border-green-500/30",
    POST: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    PATCH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    DELETE: "bg-red-500/15 text-red-300 border-red-500/30",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${colors[method]}`}>
      {method}
    </span>
  )
}

function Endpoint({
  method,
  path,
  description,
  params,
  curl,
  response,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  description: string
  params?: { name: string; type: string; required?: boolean; desc: string }[]
  curl: string
  response: string
}) {
  return (
    <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <MethodBadge method={method} />
        <code className="font-mono text-sm text-white">{path}</code>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {params && params.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Parameters</p>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              {params.map((p, i) => (
                <div key={p.name} className={`grid grid-cols-[auto_auto_1fr] gap-3 px-4 py-2.5 text-xs items-start ${i < params.length - 1 ? "border-b border-white/5" : ""}`}>
                  <code className="font-mono text-primary whitespace-nowrap">{p.name}</code>
                  <span className={`font-mono text-muted-foreground whitespace-nowrap ${p.required ? "text-red-400" : ""}`}>
                    {p.type}{p.required ? " *" : ""}
                  </span>
                  <span className="text-muted-foreground">{p.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">* required</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">cURL</p>
          <div className="rounded-lg bg-black/50 border border-white/10">
            <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto whitespace-pre">{curl}</pre>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Response</p>
          <div className="rounded-lg bg-black/50 border border-white/10">
            <pre className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto whitespace-pre">{response}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

const BASE = "https://medialane-backend-production.up.railway.app"
const KEY = "ml_live_YOUR_KEY"

export default function ApiReferencePage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        API Reference
      </Badge>
      <h1 className="text-4xl font-extrabold text-white">API Reference</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Full endpoint reference for the Medialane REST API. Base URL: <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">{BASE}</code>
      </p>

      {/* ── HEALTH ── */}
      <DocH2 id="health" border>Health</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Public uptime and system status. Use this to monitor indexer lag and database connectivity.
      </p>

      <Endpoint
        method="GET"
        path="/health"
        description="Get system health status, including database connectivity and indexer lag."
        params={[]}
        curl={`curl "${BASE}/health"`}
        response={`{
  "status": "ok",
  "timestamp": "2026-03-05T12:00:00Z",
  "database": "ok",
  "indexer": {
    "lastBlock": "6205000",
    "latestBlock": "6205005",
    "lagBlocks": 5
  }
}`}
      />

      {/* ── ORDERS ── */}
      <DocH2 id="orders" border>Orders</DocH2>
      <Endpoint
        method="GET"
        path="/v1/orders"
        description="List all open orders (listings and bids). Supports filtering, sorting, and pagination."
        params={[
          { name: "status", type: "string", desc: "Filter by status: OPEN | FULFILLED | CANCELLED" },
          { name: "nftContract", type: "string", desc: "Filter by NFT contract address" },
          { name: "currency", type: "string", desc: "Filter by payment token: USDC | USDT | ETH | STRK | WBTC" },
          { name: "sort", type: "string", desc: "Sort field: priceRaw | createdAt" },
          { name: "order", type: "string", desc: "asc | desc (default: desc)" },
          { name: "page", type: "number", desc: "Page number (default: 1)" },
          { name: "limit", type: "number", desc: "Items per page (default: 20, max: 100)" },
        ]}
        curl={`curl "${BASE}/v1/orders?status=OPEN&limit=5" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "orderHash": "0x04f7a1...",
      "offerer": "0x0591...",
      "nftContract": "0x05e7...",
      "tokenId": "42",
      "price": "500000",
      "currency": "USDC",
      "status": "OPEN",
      "orderType": "LISTING",
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "meta": { "total": 128, "page": 1, "limit": 5 }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/orders/:hash"
        description="Get a single order by its on-chain order hash."
        params={[
          { name: "hash", type: "string", required: true, desc: "The 0x-prefixed order hash" },
        ]}
        curl={`curl "${BASE}/v1/orders/0x04f7a1..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "orderHash": "0x04f7a1...",
  "offerer": "0x0591...",
  "nftContract": "0x05e7...",
  "tokenId": "42",
  "price": "500000",
  "currency": "USDC",
  "status": "OPEN"
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/orders/token/:contract/:tokenId"
        description="Get all orders for a specific token."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
        ]}
        curl={`curl "${BASE}/v1/orders/token/0x05e7.../42" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [...],
  "meta": { "total": 3, "page": 1, "limit": 20 }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/orders/user/:address"
        description="Get all orders created by a specific user address."
        params={[
          { name: "address", type: "string", required: true, desc: "Starknet user address" },
        ]}
        curl={`curl "${BASE}/v1/orders/user/0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [...],
  "meta": { "total": 7, "page": 1, "limit": 20 }
}`}
      />

      {/* ── MINTING ── */}
      <DocH2 id="minting" border>Minting</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Directly mint assets into existing collections or register new collection contracts. These operations return fully-populated calldata for immediate on-chain execution.
      </p>

      <Endpoint
        method="POST"
        path="/v1/intents/mint"
        description="Mint an NFT into an existing Medialane collection."
        params={[
          { name: "owner", type: "string", required: true, desc: "Collection owner address" },
          { name: "collectionId", type: "string", required: true, desc: "Hex or decimal collection ID" },
          { name: "recipient", type: "string", required: true, desc: "Recipient address" },
          { name: "tokenUri", type: "string", required: true, desc: "IPFS URI or metadata URL" },
          { name: "collectionContract", type: "string", desc: "Optional: registry contract override" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/mint" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "owner": "0x0591...", "collectionId": "42", "recipient": "0x0591...", "tokenUri": "ipfs://..." }'`}
        response={`{ "intentId": "clm_mnt123", "status": "SIGNED", "calls": [...] }`}
      />

      <Endpoint
        method="POST"
        path="/v1/intents/create-collection"
        description="Register a new NFT collection contract on the Medialane registry."
        params={[
          { name: "owner", type: "string", required: true, desc: "Requester address" },
          { name: "name", type: "string", required: true, desc: "Collection name" },
          { name: "symbol", type: "string", required: true, desc: "Collection symbol" },
          { name: "baseUri", type: "string", required: true, desc: "Base URI for tokens" },
          { name: "collectionContract", type: "string", desc: "Optional: registry contract override" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/create-collection" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "owner": "0x0591...", "name": "My Collection", "symbol": "MYC", "baseUri": "ipfs://..." }'`}
        response={`{ "intentId": "clm_coll123", "status": "SIGNED", "calls": [...] }`}
      />

      {/* ── COLLECTIONS ── */}
      <DocH2 id="collections" border>Collections</DocH2>

      <Endpoint
        method="GET"
        path="/v1/collections"
        description="List indexed NFT collections with floor price, volume, and token count."
        params={[
          { name: "page", type: "number", desc: "Page number" },
          { name: "limit", type: "number", desc: "Items per page" },
          { name: "owner", type: "string", desc: "Filter by collection owner address" },
          { name: "isKnown", type: "boolean", desc: "true = featured collections only" },
          { name: "sort", type: "string", desc: '"recent" (default) | "supply" | "floor" | "volume" | "name"' },
        ]}
        curl={`curl "${BASE}/v1/collections?owner=0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "contract": "0x05e7...",
      "collectionId": "1",
      "name": "Mediolano Genesis",
      "owner": "0x0591...",
      "floorPrice": "100000",
      "floorCurrency": "USDC",
      "totalVolume": "5000000",
      "tokenCount": 512
    }
  ],
  "meta": { "total": 14, "page": 1, "limit": 20 }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/collections/:contract"
        description="Get metadata and statistics for a single collection."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
        ]}
        curl={`curl "${BASE}/v1/collections/0x05e7..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "contract": "0x05e7...",
  "collectionId": "1",
  "name": "Mediolano Genesis",
  "owner": "0x0591...",
  "floorPrice": "100000",
  "totalVolume": "5000000",
  "tokenCount": 512
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/collections/:contract/tokens"
        description="List tokens in a collection."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
          { name: "page", type: "number", desc: "Page number" },
          { name: "limit", type: "number", desc: "Items per page" },
        ]}
        curl={`curl "${BASE}/v1/collections/0x05e7.../tokens?limit=10" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [...],
  "meta": { "total": 512, "page": 1, "limit": 10 }
}`}
      />

      {/* ── TOKENS ── */}
      <DocH2 id="tokens" border>Tokens</DocH2>

      <Endpoint
        method="GET"
        path="/v1/tokens/owned/:address"
        description="Get all tokens owned by a Starknet address."
        params={[
          { name: "address", type: "string", required: true, desc: "Owner's Starknet address" },
        ]}
        curl={`curl "${BASE}/v1/tokens/owned/0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "contract": "0x05e7...",
      "tokenId": "42",
      "owner": "0x0591...",
      "metadata": { "name": "Genesis #42", "image": "ipfs://..." }
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20 }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/tokens/:contract/:tokenId"
        description="Get a single token with resolved metadata. Use ?wait=true for JIT metadata resolution."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
          { name: "wait", type: "boolean", desc: "If true, blocks up to 3s to resolve missing metadata" },
        ]}
        curl={`curl "${BASE}/v1/tokens/0x05e7.../42?wait=true" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "contract": "0x05e7...",
  "tokenId": "42",
  "owner": "0x0591...",
  "metadata": {
    "name": "Genesis #42",
    "description": "...",
    "image": "ipfs://..."
  }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/tokens/:contract/:tokenId/history"
        description="Get transfer history for a token."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
        ]}
        curl={`curl "${BASE}/v1/tokens/0x05e7.../42/history" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "from": "0x0000...",
      "to": "0x0591...",
      "txHash": "0xabc...",
      "blockNumber": 7000000,
      "timestamp": "2026-03-01T10:00:00Z"
    }
  ]
}`}
      />

      {/* ── BATCH TOKENS ── */}
      <DocH2 id="batch-tokens" border>Batch Tokens</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Fetch up to 50 tokens in a single request by providing contract+tokenId pairs. More efficient than individual token lookups when hydrating a list or cart.
      </p>

      <Endpoint
        method="GET"
        path="/v1/tokens/batch"
        description="Fetch multiple tokens by contract and tokenId pairs. Returns the same shape as the single token endpoint but as an array."
        params={[
          { name: "items", type: "string", required: true, desc: "Comma-separated contract:tokenId pairs — e.g. 0x05e7...:1,0x05e7...:2 (max 50 pairs)" },
        ]}
        curl={`curl "${BASE}/v1/tokens/batch?items=0x05e7...:1,0x05e7...:2" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "contract": "0x05e7...",
      "tokenId": "1",
      "owner": "0x0591...",
      "metadata": { "name": "Genesis #1", "image": "ipfs://..." }
    },
    {
      "contract": "0x05e7...",
      "tokenId": "2",
      "owner": "0x0482...",
      "metadata": { "name": "Genesis #2", "image": "ipfs://..." }
    }
  ]
}`}
      />

      {/* ── ACTIVITIES ── */}
      <DocH2 id="activities" border>Activities</DocH2>

      <Endpoint
        method="GET"
        path="/v1/activities"
        description="List all indexed on-chain events (transfers, sales, listings, cancellations)."
        params={[
          { name: "type", type: "string", desc: "Filter: TRANSFER | SALE | LISTING | CANCEL" },
          { name: "page", type: "number", desc: "Page number" },
          { name: "limit", type: "number", desc: "Items per page" },
        ]}
        curl={`curl "${BASE}/v1/activities?type=SALE&limit=10" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "type": "SALE",
      "from": "0x0591...",
      "to": "0x0482...",
      "nftContract": "0x05e7...",
      "tokenId": "42",
      "price": "500000",
      "currency": "USDC",
      "txHash": "0xabc...",
      "timestamp": "2026-03-01T10:00:00Z"
    }
  ],
  "meta": { "total": 441, "page": 1, "limit": 10 }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/activities/:address"
        description="Get all activities for a specific user address."
        params={[
          { name: "address", type: "string", required: true, desc: "Starknet address" },
        ]}
        curl={`curl "${BASE}/v1/activities/0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [...],
  "meta": { "total": 12, "page": 1, "limit": 20 }
}`}
      />

      {/* ── INTENTS ── */}
      <DocH2 id="intents" border>Intents</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Intents orchestrate SNIP-12 typed data for listings, offers, fulfillments, and cancellations. Create an intent, sign it client-side, then submit the signature.
      </p>

      <Endpoint
        method="POST"
        path="/v1/intents/listing"
        description="Create a listing intent. Returns typed data for SNIP-12 signing."
        params={[
          { name: "nftContract", type: "string", required: true, desc: "NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
          { name: "price", type: "string", required: true, desc: "Price in smallest denomination" },
          { name: "currency", type: "string", required: true, desc: "USDC | USDT | ETH | STRK | WBTC" },
          { name: "offerer", type: "string", required: true, desc: "Seller Starknet address" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/listing" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nftContract": "0x05e7...",
    "tokenId": "42",
    "price": "500000",
    "currency": "USDC",
    "offerer": "0x0591..."
  }'`}
        response={`{
  "intentId": "clm_abc123",
  "typedData": {
    "types": { ... },
    "primaryType": "Order",
    "domain": { "name": "Medialane", "version": "1", "revision": "1" },
    "message": { ... }
  }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/intents/offer"
        description="Create an offer (bid) intent for a specific token."
        params={[
          { name: "nftContract", type: "string", required: true, desc: "Target NFT contract" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
          { name: "price", type: "string", required: true, desc: "Offer amount in smallest denomination" },
          { name: "currency", type: "string", required: true, desc: "USDC | USDT | ETH | STRK | WBTC" },
          { name: "offerer", type: "string", required: true, desc: "Buyer Starknet address" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/offer" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "nftContract": "0x05e7...", "tokenId": "42", "price": "400000", "currency": "USDC", "offerer": "0x0482..." }'`}
        response={`{ "intentId": "clm_def456", "typedData": { ... } }`}
      />

      <Endpoint
        method="POST"
        path="/v1/intents/fulfill"
        description="Create a fulfillment intent to accept an open order."
        params={[
          { name: "orderHash", type: "string", required: true, desc: "Hash of the order to fulfill" },
          { name: "fulfiller", type: "string", required: true, desc: "Fulfiller Starknet address" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/fulfill" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "orderHash": "0x04f7a1...", "fulfiller": "0x0482..." }'`}
        response={`{ "intentId": "clm_ghi789", "typedData": { ... } }`}
      />

      <Endpoint
        method="POST"
        path="/v1/intents/cancel"
        description="Create a cancellation intent for an open order."
        params={[
          { name: "orderHash", type: "string", required: true, desc: "Hash of the order to cancel" },
          { name: "offerer", type: "string", required: true, desc: "Original offerer address" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/cancel" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "orderHash": "0x04f7a1...", "offerer": "0x0591..." }'`}
        response={`{ "intentId": "clm_jkl012", "typedData": { ... } }`}
      />

      <Endpoint
        method="GET"
        path="/v1/intents/:id"
        description="Get the status of an intent."
        params={[
          { name: "id", type: "string", required: true, desc: "Intent ID" },
        ]}
        curl={`curl "${BASE}/v1/intents/clm_abc123" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "intentId": "clm_abc123",
  "status": "PENDING_SIGNATURE",
  "type": "LISTING"
}`}
      />

      <Endpoint
        method="PATCH"
        path="/v1/intents/:id/signature"
        description="Submit the SNIP-12 signature for an intent to trigger on-chain execution."
        params={[
          { name: "id", type: "string", required: true, desc: "Intent ID" },
          { name: "signature", type: "string[]", required: true, desc: "Starknet signature array [r, s]" },
        ]}
        curl={`curl -X PATCH "${BASE}/v1/intents/clm_abc123/signature" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "signature": ["0xaaa...", "0xbbb..."] }'`}
        response={`{
  "intentId": "clm_abc123",
  "status": "SUBMITTED",
  "txHash": "0xabc..."
}`}
      />

      {/* ── CHECKOUT INTENT ── */}
      <DocH2 id="checkout-intent" border>Checkout Intent</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Create fulfillment intents for multiple orders in a single request. Useful for cart-style checkout flows. Failed items return an error field rather than aborting the whole batch.
      </p>

      <Endpoint
        method="POST"
        path="/v1/intents/checkout"
        description="Batch fulfill intent creation. Accepts up to 20 order hashes. Per-item error handling — failed items return { orderHash, error } instead of rejecting the entire request."
        params={[
          { name: "fulfiller", type: "string", required: true, desc: "Fulfiller Starknet address" },
          { name: "orderHashes", type: "string[]", required: true, desc: "Array of order hashes to fulfill (max 20)" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/checkout" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fulfiller": "0x0482...",
    "orderHashes": ["0xabc...", "0xdef..."]
  }'`}
        response={`{
  "data": [
    {
      "id": "clm_xyz001",
      "orderHash": "0xabc...",
      "typedData": { "types": { ... }, "primaryType": "Order", "domain": { ... }, "message": { ... } },
      "calls": [...],
      "expiresAt": "2026-03-12T10:15:00Z"
    },
    {
      "orderHash": "0xdef...",
      "error": "Order no longer available"
    }
  ]
}`}
      />

      {/* ── METADATA ── */}
      <DocH2 id="metadata" border>Metadata</DocH2>

      <Endpoint
        method="GET"
        path="/v1/metadata/signed-url"
        description="Get a pre-signed upload URL for pinning metadata to IPFS via Medialane CDN."
        params={[]}
        curl={`curl "${BASE}/v1/metadata/signed-url" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "url": "https://ipfs.io/ipfs/...",
  "fields": { ... },
  "expiresAt": "2026-03-01T10:30:00Z"
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/metadata/upload"
        description="Upload JSON metadata. Returns an IPFS CID."
        params={[
          { name: "metadata", type: "object", required: true, desc: "ERC-721 compatible JSON metadata" },
        ]}
        curl={`curl -X POST "${BASE}/v1/metadata/upload" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "metadata": { "name": "My NFT", "description": "...", "image": "ipfs://..." } }'`}
        response={`{
  "cid": "QmXyz...",
  "uri": "ipfs://QmXyz..."
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/metadata/upload-file"
        description="Upload a media file. Returns an IPFS CID and gateway URL."
        params={[
          { name: "file", type: "File (multipart)", required: true, desc: "Image, audio, or video file" },
        ]}
        curl={`curl -X POST "${BASE}/v1/metadata/upload-file" \\
  -H "x-api-key: ${KEY}" \\
  -F "file=@artwork.png"`}
        response={`{
  "cid": "QmAbc...",
  "uri": "ipfs://QmAbc...",
  "gateway": "https://gateway.pinata.cloud/ipfs/QmAbc..."
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/metadata/resolve"
        description="Resolve and return the metadata JSON for an IPFS URI or on-chain token."
        params={[
          { name: "uri", type: "string", required: true, desc: "ipfs:// URI or https:// URL" },
        ]}
        curl={`curl "${BASE}/v1/metadata/resolve?uri=ipfs%3A%2F%2FQmXyz..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "name": "My NFT",
  "description": "...",
  "image": "ipfs://QmAbc..."
}`}
      />

      {/* ── SEARCH ── */}
      <DocH2 id="search" border>Search</DocH2>

      <Endpoint
        method="GET"
        path="/v1/search"
        description="Full-text search across tokens, collections, and users."
        params={[
          { name: "q", type: "string", required: true, desc: "Search query string" },
          { name: "type", type: "string", desc: "Filter: token | collection | user" },
          { name: "limit", type: "number", desc: "Max results (default: 10)" },
        ]}
        curl={`curl "${BASE}/v1/search?q=genesis" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "type": "collection", "contract": "0x05e7...", "name": "Mediolano Genesis" },
    { "type": "token", "contract": "0x05e7...", "tokenId": "1", "name": "Genesis #1" }
  ]
}`}
      />

      {/* ── EVENTS (SSE) ── */}
      <DocH2 id="events" border>Events (SSE)</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Subscribe to a real-time Server-Sent Events stream for transfers, order lifecycle events, and keepalive pings. Authentication uses a query parameter since browsers cannot send custom headers with the native <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">EventSource</code> API. PREMIUM plan recommended for sustained connections.
      </p>

      <Endpoint
        method="GET"
        path="/v1/events"
        description="Open a Server-Sent Events stream. The server sends transfer, order.created, order.fulfilled, order.cancelled, and ping (keepalive every 15s) events. Automatically reconnects after 10 minutes via a reconnect event."
        params={[
          { name: "apiKey", type: "string", required: true, desc: "Your API key (query param — required because EventSource cannot send custom headers)" },
          { name: "since", type: "string", desc: "ISO 8601 timestamp — resume stream from this point in time" },
        ]}
        curl={`# Open the stream (cURL streams until closed)
curl -N "${BASE}/v1/events?apiKey=${KEY}"

# Resume from a specific timestamp
curl -N "${BASE}/v1/events?apiKey=${KEY}&since=2026-03-12T10:00:00Z"

# Resume using Last-Event-ID header (standard SSE resume)
curl -N "${BASE}/v1/events?apiKey=${KEY}" \\
  -H "Last-Event-ID: evt_abc123"`}
        response={`id: evt_001
event: transfer
data: {"contractAddress":"0x05e7...","tokenId":"42","from":"0x0000...","to":"0x0591...","txHash":"0xabc...","timestamp":"2026-03-12T10:00:01Z"}

id: evt_002
event: order.created
data: {"orderHash":"0x04f7a1...","nftContract":"0x05e7...","tokenId":"42","price":"500000","currency":"USDC","offerer":"0x0591..."}

id: evt_003
event: order.fulfilled
data: {"orderHash":"0x04f7a1...","fulfiller":"0x0482...","txHash":"0xdef..."}

id: evt_004
event: order.cancelled
data: {"orderHash":"0x04f7a1...","offerer":"0x0591..."}

id: evt_005
event: ping
data: {}

event: reconnect
data: {}`}
      />

      <div className="mb-10 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Browser (native EventSource)</p>
        <div className="rounded-lg bg-black/50 border border-white/10">
          <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto whitespace-pre">{`const url = \`${BASE}/v1/events?apiKey=\${YOUR_KEY}\`
const source = new EventSource(url)

source.addEventListener("transfer", (e) => {
  const transfer = JSON.parse(e.data)
  console.log("Transfer:", transfer.contractAddress, transfer.tokenId)
})

source.addEventListener("order.fulfilled", (e) => {
  const order = JSON.parse(e.data)
  console.log("Order fulfilled:", order.orderHash)
})

source.addEventListener("order.created", (e) => {
  const order = JSON.parse(e.data)
  console.log("New listing:", order.orderHash, order.price, order.currency)
})

// Reconnect with resume on error
source.addEventListener("error", () => {
  const lastId = source.lastEventId
  source.close()
  const resumeUrl = \`${BASE}/v1/events?apiKey=\${YOUR_KEY}\${lastId ? \`&since=\${lastId}\` : ""}\`
  // reconnect: new EventSource(resumeUrl)
})`}</pre>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-4">Node.js (eventsource npm package)</p>
        <div className="rounded-lg bg-black/50 border border-white/10">
          <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto whitespace-pre">{`import EventSource from "eventsource"

const url = \`${BASE}/v1/events?apiKey=\${YOUR_KEY}\`
const source = new EventSource(url)

source.addEventListener("order.fulfilled", (e) => {
  const order = JSON.parse(e.data)
  console.log("Order fulfilled:", order.orderHash)
})

source.addEventListener("ping", () => {
  // keepalive — no action needed
})

source.addEventListener("reconnect", () => {
  // server is closing after 10 min — reconnect
  source.close()
  new EventSource(\`${BASE}/v1/events?apiKey=\${YOUR_KEY}\`)
})

// Resume from a known point using Last-Event-ID
const resumeSource = new EventSource(url, {
  headers: { "Last-Event-ID": "evt_abc123" },
})`}</pre>
        </div>
      </div>

      {/* ── PORTAL ── */}
      <DocH2 id="portal" border>Portal (Self-service)</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Portal endpoints manage your tenant account: API keys, usage stats, and webhooks (PREMIUM). These calls never count toward your monthly quota.
      </p>

      <Endpoint
        method="GET"
        path="/v1/portal/me"
        description="Get your tenant profile: plan, quota usage, and key count."
        params={[]}
        curl={`curl "${BASE}/v1/portal/me" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "tenantId": "tnt_xxx",
  "email": "you@example.com",
  "plan": "FREE",
  "quota": 50,
  "usedThisMonth": 12
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/portal/keys"
        description="List all API keys for your account."
        params={[]}
        curl={`curl "${BASE}/v1/portal/keys" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "id": "key_abc", "name": "Production", "prefix": "ml_live_abc...", "createdAt": "..." }
  ]
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/portal/keys"
        description="Create a new API key (max 5 per account)."
        params={[
          { name: "name", type: "string", required: true, desc: "A label for this key" },
        ]}
        curl={`curl -X POST "${BASE}/v1/portal/keys" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My Agent Key" }'`}
        response={`{
  "id": "key_new",
  "name": "My Agent Key",
  "key": "ml_live_FULL_KEY_SHOWN_ONCE",
  "createdAt": "..."
}`}
      />

      <Endpoint
        method="DELETE"
        path="/v1/portal/keys/:id"
        description="Delete an API key. This action is irreversible."
        params={[
          { name: "id", type: "string", required: true, desc: "Key ID" },
        ]}
        curl={`curl -X DELETE "${BASE}/v1/portal/keys/key_abc" \\
  -H "x-api-key: ${KEY}"`}
        response={`{ "success": true }`}
      />

      <Endpoint
        method="GET"
        path="/v1/portal/usage"
        description="Get 30-day daily usage breakdown."
        params={[]}
        curl={`curl "${BASE}/v1/portal/usage" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "date": "2026-03-01", "requests": 8 },
    { "date": "2026-02-28", "requests": 4 }
  ]
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/portal/usage/recent"
        description="Get the last N request log entries."
        params={[
          { name: "limit", type: "number", desc: "Max entries (default: 20)" },
        ]}
        curl={`curl "${BASE}/v1/portal/usage/recent?limit=5" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "method": "GET", "path": "/v1/orders", "status": 200, "ts": "2026-03-01T10:01:00Z" }
  ]
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/portal/webhooks"
        description="List registered webhooks. PREMIUM only."
        params={[]}
        curl={`curl "${BASE}/v1/portal/webhooks" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "id": "wh_abc", "url": "https://yourapp.com/hook", "events": ["ORDER_CREATED"], "active": true }
  ]
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/portal/webhooks"
        description="Register a new webhook endpoint. PREMIUM only."
        params={[
          { name: "url", type: "string", required: true, desc: "HTTPS endpoint to receive events" },
          { name: "events", type: "string[]", required: true, desc: "ORDER_CREATED | ORDER_FULFILLED | ORDER_CANCELLED | TRANSFER" },
        ]}
        curl={`curl -X POST "${BASE}/v1/portal/webhooks" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "url": "https://yourapp.com/hook", "events": ["ORDER_CREATED", "TRANSFER"] }'`}
        response={`{
  "id": "wh_new",
  "url": "https://yourapp.com/hook",
  "events": ["ORDER_CREATED", "TRANSFER"],
  "secret": "whsec_SHOWN_ONCE"
}`}
      />

      <Endpoint
        method="DELETE"
        path="/v1/portal/webhooks/:id"
        description="Delete a webhook."
        params={[
          { name: "id", type: "string", required: true, desc: "Webhook ID" },
        ]}
        curl={`curl -X DELETE "${BASE}/v1/portal/webhooks/wh_abc" \\
  -H "x-api-key: ${KEY}"`}
        response={`{ "success": true }`}
      />

      {/* ── COLLECTION CLAIMS ── */}
      <DocH2 id="claims" border>Collection Claims</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Claim ownership of an existing Starknet ERC-721 collection. Three verification paths available: automatic on-chain check (requires Clerk JWT), SNIP-12 signature challenge, or manual email review.
      </p>

      <Endpoint
        method="POST"
        path="/v1/collections/claim"
        description="Path 1: Auto-verify ownership on-chain. Requires both a tenant API key and a Clerk session JWT in the Authorization header. The API checks that the authenticated wallet is the on-chain owner of the contract."
        params={[
          { name: "contractAddress", type: "string", required: true, desc: "The ERC-721 contract address to claim" },
          { name: "walletAddress", type: "string", required: true, desc: "The Starknet wallet address claiming ownership" },
        ]}
        curl={`curl -X POST "${BASE}/v1/collections/claim" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "contractAddress": "0x076c...", "walletAddress": "0x03d0..." }'`}
        response={`{
  "verified": true,
  "collection": { "contractAddress": "0x076c...", "name": "My Collection", "claimedBy": "0x03d0..." }
}

// If not verified:
{ "verified": false, "reason": "not_owner" }`}
      />

      <Endpoint
        method="POST"
        path="/v1/collections/claim/challenge"
        description="Path 2 (step 1): Request a SNIP-12 typed-data challenge for a contract address. Sign the returned typedData with your Starknet wallet, then submit to /verify."
        params={[
          { name: "contractAddress", type: "string", required: true, desc: "The ERC-721 contract address to claim" },
          { name: "walletAddress", type: "string", required: true, desc: "The wallet that will sign the challenge" },
        ]}
        curl={`curl -X POST "${BASE}/v1/collections/claim/challenge" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "contractAddress": "0x076c...", "walletAddress": "0x03d0..." }'`}
        response={`{
  "challengeId": "chal_abc123",
  "typedData": { "domain": { "name": "Medialane", "version": "1", "revision": "1" }, "..." },
  "expiresAt": "2026-03-15T16:00:00Z"
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/collections/claim/verify"
        description="Path 2 (step 2): Submit the SNIP-12 signature from the challenge step. If valid, the collection is marked as claimed by the wallet."
        params={[
          { name: "challengeId", type: "string", required: true, desc: "Challenge ID from /claim/challenge" },
          { name: "signature", type: "object", required: true, desc: '{ r: string; s: string } — starknet.js signature object' },
        ]}
        curl={`curl -X POST "${BASE}/v1/collections/claim/verify" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "challengeId": "chal_abc123", "signature": { "r": "0x...", "s": "0x..." } }'`}
        response={`{
  "verified": true,
  "collection": { "contractAddress": "0x076c...", "claimedBy": "0x03d0..." }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/collections/claim/request"
        description="Path 3: Submit a manual claim request for admin review. No wallet signature required — our team will verify and reach out by email."
        params={[
          { name: "contractAddress", type: "string", required: true, desc: "The ERC-721 contract address to claim" },
          { name: "email", type: "string", required: true, desc: "Email address for review correspondence" },
          { name: "walletAddress", type: "string", desc: "Optional: your Starknet wallet address" },
          { name: "notes", type: "string", desc: "Optional: context about your connection to the collection" },
        ]}
        curl={`curl -X POST "${BASE}/v1/collections/claim/request" \\
  -H "x-api-key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "contractAddress": "0x076c...", "email": "creator@example.com", "notes": "I deployed this contract in block 7488000" }'`}
        response={`{
  "claim": {
    "id": "clm_xyz",
    "contractAddress": "0x076c...",
    "status": "PENDING",
    "verificationMethod": "MANUAL",
    "createdAt": "2026-03-15T15:00:00Z"
  }
}`}
      />

      {/* ── PROFILES ── */}
      <DocH2 id="profiles" border>Profiles</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Enriched display metadata for collections and creators. Collection profiles can only be updated by the wallet that claimed the collection (requires Clerk JWT). Creator profiles can be updated by the profile owner.
      </p>

      <Endpoint
        method="GET"
        path="/v1/collections/:contract/profile"
        description="Get the display profile for a collection (displayName, description, cover image, banner, social links). Returns null if no profile has been set."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
        ]}
        curl={`curl "${BASE}/v1/collections/0x076c.../profile" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "contractAddress": "0x076c...",
  "chain": "STARKNET",
  "displayName": "The Revenge of Shiroi",
  "description": "Music · Video · Concept Art",
  "image": "ipfs://bafybeif2a...",
  "bannerImage": "ipfs://bafybeic...",
  "websiteUrl": "https://shiroi.io",
  "twitterUrl": "https://x.com/shiroi",
  "discordUrl": null,
  "telegramUrl": null,
  "updatedAt": "2026-03-15T15:00:00Z"
}`}
      />

      <Endpoint
        method="PATCH"
        path="/v1/collections/:contract/profile"
        description="Update the display profile for a collection. Requires a Clerk session JWT — the authenticated wallet must be the claimedBy address for this collection."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address (URL param)" },
          { name: "displayName", type: "string", desc: "Display name (overrides on-chain name)" },
          { name: "description", type: "string", desc: "Collection description" },
          { name: "image", type: "string", desc: "Cover image IPFS URI (ipfs://...)" },
          { name: "bannerImage", type: "string", desc: "Banner image IPFS URI (ipfs://...)" },
          { name: "websiteUrl", type: "string", desc: "Website URL" },
          { name: "twitterUrl", type: "string", desc: "Twitter/X URL" },
          { name: "discordUrl", type: "string", desc: "Discord server URL" },
          { name: "telegramUrl", type: "string", desc: "Telegram URL" },
        ]}
        curl={`curl -X PATCH "${BASE}/v1/collections/0x076c.../profile" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "displayName": "Shiroi Collection", "description": "Music & Concept Art", "websiteUrl": "https://shiroi.io" }'`}
        response={`{
  "contractAddress": "0x076c...",
  "displayName": "Shiroi Collection",
  "description": "Music & Concept Art",
  "websiteUrl": "https://shiroi.io",
  "updatedAt": "2026-03-15T15:05:00Z"
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/creators/:wallet/profile"
        description="Get the display profile for a creator wallet (displayName, bio, avatar, banner, social links). Returns null if no profile has been set."
        params={[
          { name: "wallet", type: "string", required: true, desc: "Starknet wallet address" },
        ]}
        curl={`curl "${BASE}/v1/creators/0x03d0.../profile" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "walletAddress": "0x03d0...",
  "chain": "STARKNET",
  "displayName": "Kalamaha",
  "bio": "Visual artist on Starknet",
  "avatarImage": "ipfs://bafkrei...",
  "bannerImage": null,
  "websiteUrl": "https://kalamaha.art",
  "twitterUrl": "https://x.com/kalamaha",
  "discordUrl": null,
  "telegramUrl": null,
  "updatedAt": "2026-03-15T15:00:00Z"
}`}
      />

      <Endpoint
        method="PATCH"
        path="/v1/creators/:wallet/profile"
        description="Update a creator profile. Requires a Clerk session JWT — the authenticated wallet must match the wallet URL parameter."
        params={[
          { name: "wallet", type: "string", required: true, desc: "Starknet wallet address (URL param)" },
          { name: "displayName", type: "string", desc: "Display name or handle" },
          { name: "bio", type: "string", desc: "Short bio" },
          { name: "avatarImage", type: "string", desc: "Avatar IPFS URI (ipfs://...)" },
          { name: "bannerImage", type: "string", desc: "Banner IPFS URI (ipfs://...)" },
          { name: "websiteUrl", type: "string", desc: "Website URL" },
          { name: "twitterUrl", type: "string", desc: "Twitter/X URL" },
          { name: "discordUrl", type: "string", desc: "Discord URL" },
          { name: "telegramUrl", type: "string", desc: "Telegram URL" },
        ]}
        curl={`curl -X PATCH "${BASE}/v1/creators/0x03d0.../profile" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "displayName": "Kalamaha", "bio": "Visual artist on Starknet" }'`}
        response={`{
  "walletAddress": "0x03d0...",
  "displayName": "Kalamaha",
  "bio": "Visual artist on Starknet",
  "updatedAt": "2026-03-15T15:05:00Z"
}`}
      />

      {/* ── COMMENTS ── */}
      <DocH2 id="comments" border>On-chain Comments</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Permanent on-chain comments posted to the NFTComments contract on Starknet. Comments are indexed by the backend and surfaced here. The Cairo contract enforces a 60-second per-address rate limit and comments cannot be deleted on-chain, only hidden at the application layer after reports.
      </p>

      <Endpoint
        method="GET"
        path="/v1/tokens/:contract/:tokenId/comments"
        description="List indexed on-chain comments for a token, newest first. Hidden comments (3+ reports) are excluded."
        params={[
          { name: "contract", type: "string", required: true, desc: "NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Token ID" },
          { name: "page", type: "number", desc: "Page number (default: 1)" },
          { name: "limit", type: "number", desc: "Results per page (default: 20, max: 100)" },
        ]}
        curl={`curl "${BASE}/v1/tokens/0x05e7.../42/comments?limit=20" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "id": "cmt_01j...",
      "chain": "starknet",
      "contractAddress": "0x05e7...",
      "tokenId": "42",
      "author": "0x03d0...",
      "content": "This is a permanent mark on Starknet.",
      "txHash": "0x07a2...",
      "blockNumber": "789123",
      "postedAt": "2026-03-22T14:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5 }
}`}
      />

      {/* ── COUNTER-OFFERS ── */}
      <DocH2 id="counter-offers" border>Counter-offers</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Sellers can respond to buyer bids with a counter-offer — a new on-chain listing linked to the original bid. The original bid is marked <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">COUNTER_OFFERED</code>. The buyer can then accept (fulfill the counter listing) or ignore it.
      </p>

      <Endpoint
        method="GET"
        path="/v1/orders/counter-offers"
        description="List counter-offer listings. Pass originalOrderHash for the buyer's view (one counter per bid) or sellerAddress for the seller's view (all counters they have sent). At least one query param is required."
        params={[
          { name: "originalOrderHash", type: "string", desc: "Original bid order hash — returns the counter-offer for this specific bid" },
          { name: "sellerAddress", type: "string", desc: "Seller address — returns all counter-offers sent by this seller" },
          { name: "page", type: "number", desc: "Page number (default: 1)" },
          { name: "limit", type: "number", desc: "Results per page (default: 20)" },
        ]}
        curl={`curl "${BASE}/v1/orders/counter-offers?originalOrderHash=0x04f7a1..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "id": "ord_01j...",
      "orderHash": "0x0a1b...",
      "offerer": "0x0591...",
      "status": "ACTIVE",
      "parentOrderHash": "0x04f7a1...",
      "counterOfferMessage": "Best I can do!",
      "price": { "raw": "750000", "formatted": "0.75", "currency": "USDC", "decimals": 6 },
      "endTime": "2026-03-25T00:00:00Z",
      "token": { "name": "Genesis #42", "image": "ipfs://...", "description": null }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/intents/counter-offer"
        description="Create a counter-offer intent. The seller proposes a new price for the NFT in response to a buyer's active bid. Currency is derived server-side from the original bid token — do not pass a currency field. Requires a Clerk session JWT for authentication; the seller address must match the consideration.recipient of the original bid."
        params={[
          { name: "sellerAddress", type: "string", required: true, desc: "Seller's wallet address" },
          { name: "originalOrderHash", type: "string", required: true, desc: "Order hash of the original buyer bid" },
          { name: "counterPrice", type: "string", required: true, desc: "Counter price as raw wei integer string" },
          { name: "durationSeconds", type: "number", required: true, desc: "Validity duration in seconds (3600–2592000)" },
          { name: "message", type: "string", desc: "Optional seller message to buyer (max 500 chars)" },
        ]}
        curl={`curl -X POST "${BASE}/v1/intents/counter-offer" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sellerAddress": "0x0591...",
    "originalOrderHash": "0x04f7a1...",
    "counterPrice": "750000",
    "durationSeconds": 86400,
    "message": "Best I can do!"
  }'`}
        response={`{
  "data": {
    "id": "int_01j...",
    "typedData": { ... },
    "calls": [ ... ],
    "expiresAt": "2026-03-25T00:00:00Z"
  }
}`}
      />

      {/* ── REMIX LICENSING ── */}
      <DocH2 id="remix-licensing" border>Remix Licensing</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Creators can allow others to remix their NFTs under specific license terms. Open licenses (CC0, CC BY, CC BY-SA, CC BY-NC) are auto-approved. Custom terms require creator approval before the requester can mint. All endpoints require a Clerk JWT except the public remixes list.
      </p>

      <Endpoint
        method="GET"
        path="/v1/tokens/:contract/:tokenId/remixes"
        description="List public remixes of a token. Price and currency fields are omitted — this is a public endpoint. Returns minted remixes only."
        params={[
          { name: "contract", type: "string", required: true, desc: "Original NFT contract address" },
          { name: "tokenId", type: "string", required: true, desc: "Original token ID" },
          { name: "page", type: "number", desc: "Page number (default: 1)" },
          { name: "limit", type: "number", desc: "Results per page (default: 20)" },
        ]}
        curl={`curl "${BASE}/v1/tokens/0x05e7.../42/remixes" \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    {
      "id": "rxo_01j...",
      "remixContract": "0x06a3...",
      "remixTokenId": "1",
      "licenseType": "CC BY",
      "commercial": true,
      "derivatives": true,
      "createdAt": "2026-03-23T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3 }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/remix-offers"
        description="Submit a custom remix offer for a token. If the token's license is not open (CC0/CC BY/CC BY-SA/CC BY-NC), the creator must approve before the requester can mint. Requires Clerk JWT."
        params={[
          { name: "originalContract", type: "string", required: true, desc: "Original NFT contract address" },
          { name: "originalTokenId", type: "string", required: true, desc: "Original token ID" },
          { name: "licenseType", type: "string", required: true, desc: "Requested license (e.g. CC BY-NC)" },
          { name: "commercial", type: "boolean", required: true, desc: "Commercial use requested" },
          { name: "derivatives", type: "boolean", required: true, desc: "Derivatives allowed" },
          { name: "royaltyPct", type: "number", desc: "Royalty percentage (0–100)" },
          { name: "proposedPrice", type: "string", desc: "Proposed payment as raw wei integer string" },
          { name: "proposedCurrency", type: "string", desc: "Token address of proposed payment currency" },
          { name: "message", type: "string", desc: "Optional message to the creator" },
        ]}
        curl={`curl -X POST "${BASE}/v1/remix-offers" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "originalContract": "0x05e7...",
    "originalTokenId": "42",
    "licenseType": "CC BY-NC",
    "commercial": false,
    "derivatives": true,
    "royaltyPct": 10,
    "message": "Would love to remix this for my EP cover"
  }'`}
        response={`{
  "data": {
    "id": "rxo_01j...",
    "status": "PENDING",
    "originalContract": "0x05e7...",
    "originalTokenId": "42",
    "creatorAddress": "0x0591...",
    "requesterAddress": "0x03d0...",
    "licenseType": "CC BY-NC",
    "commercial": false,
    "derivatives": true,
    "royaltyPct": 10,
    "approvedCollection": null,
    "remixContract": null,
    "remixTokenId": null,
    "orderHash": null,
    "expiresAt": "2026-04-23T10:00:00Z",
    "createdAt": "2026-03-23T10:00:00Z"
  }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/remix-offers/auto"
        description="Submit an auto remix offer for a token with an open license (CC0, CC BY, CC BY-SA, CC BY-NC). Auto-approved immediately — no creator action needed. Requires Clerk JWT."
        params={[
          { name: "originalContract", type: "string", required: true, desc: "Original NFT contract address" },
          { name: "originalTokenId", type: "string", required: true, desc: "Original token ID" },
          { name: "licenseType", type: "string", required: true, desc: "Open license type (must be CC0, CC BY, CC BY-SA, or CC BY-NC)" },
        ]}
        curl={`curl -X POST "${BASE}/v1/remix-offers/auto" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "originalContract": "0x05e7...", "originalTokenId": "7", "licenseType": "CC0" }'`}
        response={`{ "data": { "id": "rxo_01j...", "status": "AUTO_PENDING", ... } }`}
      />

      <Endpoint
        method="POST"
        path="/v1/remix-offers/self/confirm"
        description="Record a self-remix — the token owner remixing their own asset. Call after the remix has been minted on-chain. Requires Clerk JWT."
        params={[
          { name: "originalContract", type: "string", required: true, desc: "Original NFT contract address" },
          { name: "originalTokenId", type: "string", required: true, desc: "Original token ID" },
          { name: "remixContract", type: "string", required: true, desc: "Remix NFT contract address" },
          { name: "remixTokenId", type: "string", required: true, desc: "Remix token ID" },
          { name: "licenseType", type: "string", required: true, desc: "License type applied to the remix" },
          { name: "commercial", type: "boolean", required: true, desc: "Commercial use" },
          { name: "derivatives", type: "boolean", required: true, desc: "Further derivatives allowed" },
          { name: "royaltyPct", type: "number", desc: "Royalty percentage" },
        ]}
        curl={`curl -X POST "${BASE}/v1/remix-offers/self/confirm" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "originalContract": "0x05e7...", "originalTokenId": "42", "remixContract": "0x06a3...", "remixTokenId": "1", "licenseType": "CC BY", "commercial": true, "derivatives": true }'`}
        response={`{ "data": { "id": "rxo_01j...", "status": "SELF_MINTED", ... } }`}
      />

      <Endpoint
        method="GET"
        path="/v1/remix-offers"
        description="List remix offers for the authenticated user. Pass role=creator to see incoming offers (you are the original creator), or role=requester to see offers you made. Requires Clerk JWT."
        params={[
          { name: "role", type: "string", required: true, desc: '"creator" or "requester"' },
          { name: "page", type: "number", desc: "Page (default: 1)" },
          { name: "limit", type: "number", desc: "Results per page (default: 20)" },
        ]}
        curl={`curl "${BASE}/v1/remix-offers?role=creator" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT"`}
        response={`{
  "data": [ { "id": "rxo_01j...", "status": "PENDING", "requesterAddress": "0x03d0...", ... } ],
  "meta": { "page": 1, "limit": 20, "total": 2 }
}`}
      />

      <Endpoint
        method="POST"
        path="/v1/remix-offers/:id/confirm"
        description="Creator approves a pending remix offer and records the minted remix on-chain coordinates. Requires Clerk JWT — caller must be the creator of the original token."
        params={[
          { name: "id", type: "string", required: true, desc: "Remix offer ID (URL param)" },
          { name: "approvedCollection", type: "string", required: true, desc: "Collection contract where the remix will be minted" },
          { name: "remixContract", type: "string", required: true, desc: "Remix NFT contract address (usually same as approvedCollection)" },
          { name: "remixTokenId", type: "string", required: true, desc: "Minted remix token ID" },
          { name: "orderHash", type: "string", desc: "Marketplace order hash if a payment was arranged" },
        ]}
        curl={`curl -X POST "${BASE}/v1/remix-offers/rxo_01j.../confirm" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "approvedCollection": "0x06a3...", "remixContract": "0x06a3...", "remixTokenId": "1" }'`}
        response={`{ "data": { "id": "rxo_01j...", "status": "APPROVED", "remixContract": "0x06a3...", "remixTokenId": "1", ... } }`}
      />

      <Endpoint
        method="POST"
        path="/v1/remix-offers/:id/reject"
        description="Creator rejects a pending remix offer. Requires Clerk JWT — caller must be the creator of the original token."
        params={[
          { name: "id", type: "string", required: true, desc: "Remix offer ID (URL param)" },
        ]}
        curl={`curl -X POST "${BASE}/v1/remix-offers/rxo_01j.../reject" \\
  -H "x-api-key: ${KEY}" \\
  -H "Authorization: Bearer CLERK_SESSION_JWT"`}
        response={`{ "data": { "id": "rxo_01j...", "status": "REJECTED", ... } }`}
      />

      {/* ── POP PROTOCOL ── */}
      <DocH2 id="pop-protocol" border>POP Protocol</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Proof of Participation claim collections for events — conferences, workshops, hackathons, bootcamps. Each collection has one claimable token per eligible wallet. On-chain minting is handled via the SDK <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.services.pop</code>.
      </p>

      <Endpoint
        method="GET"
        path="/v1/pop/eligibility/:collection/:wallet"
        description="Check whether a single wallet is eligible to claim from a POP collection and whether it has already claimed."
        params={[
          { name: "collection", type: "string", required: true, desc: "POP collection contract address" },
          { name: "wallet", type: "string", required: true, desc: "Wallet address to check" },
        ]}
        curl={`curl "${BASE}/v1/pop/eligibility/0x00b32c.../0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": {
    "isEligible": true,
    "hasClaimed": false,
    "tokenId": null
  }
}`}
      />

      <Endpoint
        method="GET"
        path="/v1/pop/eligibility/:collection"
        description="Batch eligibility check — pass up to 100 wallet addresses as a comma-separated wallets query param."
        params={[
          { name: "collection", type: "string", required: true, desc: "POP collection contract address (URL param)" },
          { name: "wallets", type: "string", required: true, desc: "Comma-separated wallet addresses (max 100)" },
        ]}
        curl={`curl "${BASE}/v1/pop/eligibility/0x00b32c...?wallets=0x0591...,0x06a3..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": [
    { "wallet": "0x0591...", "isEligible": true,  "hasClaimed": false, "tokenId": null },
    { "wallet": "0x06a3...", "isEligible": false, "hasClaimed": false, "tokenId": null }
  ]
}`}
      />

      {/* ── COLLECTION DROP ── */}
      <DocH2 id="collection-drop" border>Collection Drop</DocH2>
      <p className="text-sm text-muted-foreground mb-6">
        Public minting campaigns with configurable claim conditions: price, supply cap, time window, and per-wallet limits. On-chain minting and configuration are handled via the SDK <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.services.drop</code>.
      </p>

      <Endpoint
        method="GET"
        path="/v1/drop/mint-status/:collection/:wallet"
        description="Return how many tokens a wallet has minted from a Drop collection and the total minted across all wallets."
        params={[
          { name: "collection", type: "string", required: true, desc: "Drop collection contract address" },
          { name: "wallet", type: "string", required: true, desc: "Wallet address to check" },
        ]}
        curl={`curl "${BASE}/v1/drop/mint-status/0x03587f.../0x0591..." \\
  -H "x-api-key: ${KEY}"`}
        response={`{
  "data": {
    "mintedByWallet": 2,
    "totalMinted": 347
  }
}`}
      />

      {/* ── TECHNICAL DETAILS ── */}
      <DocH2 id="technical" border>Technical Details</DocH2>

      <h3 className="text-lg font-semibold text-white mt-6 mb-2">SNIP-12 Domain</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Medialane uses SNIP-12 for off-chain message signing. If you are building your own signer, use the following domain:
      </p>
      <DocCodeBlock>{`{
  "name": "Medialane",
  "version": "1",
  "revision": "1"
}`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-2">Address Normalization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        The API normalizes all addresses server-side to 64-character lowercase hex strings (prefixed with <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">0x</code>). You can pass any valid Starknet address format — short, long, or mixed-case — and the API will handle normalization automatically. The <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">@medialane/sdk</code> also normalizes addresses before every API call.
      </p>
    </div>
  )
}
