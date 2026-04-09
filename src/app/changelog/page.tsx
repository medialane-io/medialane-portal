import { Badge } from "@/src/components/ui/badge"
import { BackgroundGradients } from "@/src/components/background-gradients"

interface ChangelogEntry {
  date: string
  title: string
  items: string[]
  tag?: string
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-04-09",
    title: "SDK v0.6.4 — Collection Drop + POP Protocol",
    tag: "Release",
    items: [
      "POP Protocol (v0.6.0) — Proof of Participation claim collections for events (conferences, workshops, hackathons, bootcamps). One claimable token per eligible wallet per collection",
      "SDK v0.6.x: PopService added to client.services.pop — claim(), adminMint(), addToAllowlist(), batchAddToAllowlist(), createCollection()",
      "SDK v0.6.x: client.api.getPopCollections(), getPopEligibility(collection, wallet), getPopEligibilityBatch(collection, wallets) added",
      "SDK v0.6.x: PopClaimStatus, PopBatchEligibilityItem, PopEventType, CreatePopCollectionParams types exported",
      "SDK v0.6.x: POP_FACTORY_CONTRACT_MAINNET, POP_COLLECTION_CLASS_HASH_MAINNET, POPCollectionABI, POPFactoryABI exported",
      "Collection Drop (v0.6.1) — public minting campaigns with configurable claim conditions: price, supply cap, time window, per-wallet limits, allowlist gate",
      "SDK v0.6.x: DropService added to client.services.drop — claim(), adminMint(), setClaimConditions(), setAllowlistEnabled(), addToAllowlist(), batchAddToAllowlist(), setPaused(), withdrawPayments(), createDrop()",
      "SDK v0.6.x: client.api.getDropCollections(), getDropMintStatus(collection, wallet) added",
      "SDK v0.6.x: DropMintStatus, ClaimConditions, CreateDropParams types exported",
      "SDK v0.6.x: DROP_FACTORY_CONTRACT_MAINNET, DROP_COLLECTION_CLASS_HASH_MAINNET, DropCollectionABI, DropFactoryABI exported",
      "CollectionSource union extended with POP_PROTOCOL and COLLECTION_DROP — use getCollections() with source filter or the dedicated getPopCollections() / getDropCollections() helpers",
    ],
  },
  {
    date: "2026-04-02",
    title: "SDK v0.5.7 — Gated Content Fields",
    tag: "Feature",
    items: [
      "ApiCollectionProfile.hasGatedContent: boolean — indicates whether a collection has gated content configured",
      "ApiCollectionProfile.gatedContentTitle: string | null — public title of gated content shown to all visitors; the actual URL is holder-only via GET /v1/collections/:contract/gated-content (requires Clerk JWT + NFT ownership verification)",
    ],
  },
  {
    date: "2026-03-29",
    title: "SDK v0.5.3 — Counter-offers + Remix Licensing",
    tag: "Release",
    items: [
      "Counter-offer flow — POST /v1/intents/counter-offer creates a SNIP-12 structured counter-offer with custom price, duration, and optional message. GET /v1/orders/counter-offers lists by originalOrderHash or sellerAddress",
      "SDK v0.5.x: OrderStatus extended with COUNTER_OFFERED; IntentType extended with COUNTER_OFFER",
      "SDK v0.5.x: createCounterOfferIntent(params, clerkToken) and getCounterOffers(query) added to ApiClient",
      "Remix Licensing — full offer + self-remix system. Open licenses (CC0, CC BY, CC BY-SA, CC BY-NC) are auto-approved; custom terms require creator approval before the requester can mint",
      "SDK v0.5.x: submitRemixOffer(), submitAutoRemixOffer(), confirmSelfRemix(), getRemixOffers(), getRemixOffer(), confirmRemixOffer(), rejectRemixOffer() added to ApiClient",
      "SDK v0.5.x: RemixOfferStatus, ApiRemixOffer, ApiPublicRemix, OPEN_LICENSES, OpenLicense types exported",
      "GET /v1/tokens/:contract/:tokenId/remixes — public remix list for any token (no auth required)",
    ],
  },
  {
    date: "2026-03-22",
    title: "On-chain NFT Comments",
    tag: "Feature",
    items: [
      "Permanent on-chain comments via NFTComments Cairo contract (mainnet). Any wallet can comment on any indexed token — immutable and Voyager-verifiable",
      "GET /v1/tokens/:contract/:tokenId/comments — list indexed comments, newest first. Comments with 3+ unique reports are automatically hidden",
      "Backend indexer polls comment events and skips comments for tokens not in the Medialane registry",
      "Cairo contract enforces a 60-second per-address rate limit on-chain to prevent spam",
      "COMMENT added to ReportTargetType — auto-hidden after 3 unique reports",
      "SDK v0.4.8: ApiComment type and getTokenComments(contract, tokenId, opts?) method",
    ],
  },
  {
    date: "2026-03-20",
    title: "Currency Expansion + IP Types & Templates",
    tag: "Feature",
    items: [
      "Currency expansion — WBTC and ETH added as listing/offer currencies. USDC.e removed. Supported set: USDC, USDT, ETH, STRK, WBTC",
      "12 canonical IP types: Audio, Art, Video, Photography, NFT, Patents, Posts, Publications, Documents, RWA, Software, Custom",
      "Dynamic template fields per IP type — assets carry structured attributes (licenseType, ipType, type-specific fields) as standard IPFS attributes entries",
      "Media tab with embed players for YouTube, Spotify, SoundCloud, and TikTok content",
      "ChipiPay upgraded to v14 — new ChipiWalletPanel component and usePasskeyAuth / usePasskeySetup hooks",
      "Floor price bug fix — no longer stored as raw wei when consideration token is unknown; correctly stored as null",
    ],
  },
  {
    date: "2026-03-16",
    title: "Collection baseUri + Creator Attribution",
    tag: "Fix",
    items: [
      "Create collection flow now uploads collection metadata JSON to IPFS and sets the resulting CID as baseUri on-chain — collection images resolve correctly in dapp.medialane.io",
      "Asset IPFS metadata now includes a Creator attribute carrying the minter wallet address",
      "External link fields added to both create-collection and create-asset flows — previously hardcoded to medialane.io",
      "GET /v1/orders 500 error fixed — $queryRaw enum comparison now uses explicit ::\"OrderStatus\" cast in PostgreSQL",
    ],
  },
  {
    date: "2026-03-15",
    title: "Collection Claims + Profiles — SDK v0.4.1",
    tag: "Release",
    items: [
      "Collection claim flow — 3 paths: on-chain auto-verify (POST /v1/collections/claim), SNIP-12 challenge/verify (POST /v1/collections/claim/challenge + /verify), and manual email request (POST /v1/collections/claim/request)",
      "Collection profiles — GET/PATCH /v1/collections/:contract/profile for enriched display metadata (displayName, description, cover image, banner, social links)",
      "Creator profiles — GET/PATCH /v1/creators/:wallet/profile for per-creator display metadata",
      "ApiCollection now includes source (MEDIALANE_REGISTRY | EXTERNAL | PARTNERSHIP | IP_TICKET | IP_CLUB | GAME) and claimedBy fields",
      "SDK v0.4.1: claimCollection(), requestCollectionClaim(), getCollectionProfile(), updateCollectionProfile(), getCreatorProfile(), updateCreatorProfile() methods added to ApiClient",
      "SDK v0.4.1: ApiCollectionClaim, ApiAdminCollectionClaim, ApiCollectionProfile, ApiCreatorProfile types exported",
    ],
  },
  {
    date: "2026-03-12",
    title: "Backend v0.2.0 + SDK v0.4.0",
    tag: "Release",
    items: [
      "Batch token fetch: GET /v1/tokens/batch — fetch up to 50 tokens in one request",
      "Batch checkout intent: POST /v1/intents/checkout — fulfill up to 20 orders at once with per-item error handling",
      "Real-time SSE stream: GET /v1/events — subscribe to transfers, order lifecycle events, and keepalive pings",
      "Search upgraded to PostgreSQL full-text with ts_rank relevance scoring",
      "SDK v0.4.0: typed error codes (MedialaneErrorCode) on all errors — MedialaneError and MedialaneApiError now expose .code",
      "SDK v0.4.0: automatic retry with exponential backoff — configurable via retryOptions (maxAttempts, baseDelayMs, maxDelayMs); 4xx errors not retried",
      "SDK v0.4.0: Sepolia network guard — throws NETWORK_NOT_SUPPORTED unless contract addresses are explicitly provided",
      "SDK v0.4.0: CollectionSort named type — \"recent\" | \"supply\" | \"floor\" | \"volume\" | \"name\"",
    ],
  },
  {
    date: "2026-03-01",
    title: "Portal v1 Launch",
    tag: "Launch",
    items: [
      "API key management — create and revoke up to 5 keys per account",
      "Usage dashboard with 30-day daily chart",
      "Monthly quota progress bar (FREE: 50 req/month)",
      "Recent requests table with method, path, and status",
      "Quickstart cURL snippets in the portal",
      "Webhooks support for PREMIUM tenants (ORDER_CREATED, ORDER_FULFILLED, ORDER_CANCELLED, TRANSFER)",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
          <div className="mb-10 space-y-3">
            <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
              Changelog
            </Badge>
            <h1 className="text-4xl font-extrabold text-white">What&apos;s new</h1>
            <p className="text-muted-foreground">
              A running log of new features, improvements, and fixes.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-2.5 top-2 bottom-0 w-px bg-white/10" />

            <div className="space-y-12">
              {ENTRIES.map((entry) => (
                <div key={entry.date} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-black" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <time className="text-xs font-mono text-muted-foreground">{entry.date}</time>
                      {entry.tag && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {entry.tag}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white">{entry.title}</h2>

                    <ul className="space-y-2">
                      {entry.items.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="text-primary flex-shrink-0 mt-0.5">–</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
