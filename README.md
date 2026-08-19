# Medialane Portal 

**Developer and Business Portal for Programmable IP: [portal.medialane.io](https://portal.medialane.io)**

[portal.medialane.io](https://portal.medialane.io) is the enterprise, developer and ai agent facing gateway to tokenization and monetization of digital assets onchain: Launchpad services, API access, SDK documentation, API key management, webhooks, usage analytics.

Everything you need to build Programmable IP onchain, in one REST API.

---

## What is Medialane?

Medialane is infrastructure for the **creative economy onchain**. It enables creators, businesses, and AI agents to own, license, and trade intellectual property as digital assets with programmable licensing terms embedded immutably in IPFS metadata, compliant with 181 countries worldwide.

The platform operates through three integrated products:

- **[medialane.io](https://medialane.io)**: Creator launchpad and nft marketplace with frictionless user experience. Mint IP assets, trade NFTs, manage collections.
- **[starknet.medialane.io](https://starknet.medialane.io)**: Creator launchpad and nft marketplace for Starknet users.
- **[portal.medialane.io](https://portal.medialane.io)**: Enterprise and Developer portal. API keys, REST endpoint docs, SDK quickstart, webhooks, usage analytics.

---

## Features

### For Developers
- **REST API access**: query orders, tokens, collections, activities, search, all from one API key
- **API key management**: create, view, and revoke keys from the `/account` dashboard
- **Webhooks**: subscribe to `ORDER_CREATED`, `ORDER_FULFILLED`, `ORDER_CANCELLED`, `TRANSFER` events (PREMIUM)
- **Usage analytics**: 30-day request history by day
- **SDK documentation**: `@medialane/sdk` quickstart, full method reference
- **Full API reference**: every endpoint, parameter, and response shape documented at `/docs/api`
- **Agent quickstart**: SIWS auth flow, credit top-up, autonomous agent patterns at `/docs/agents`

### For Creators
- **Starknet wallet auth**: sign in with Starknet (SIWS)
- **Credit system**: pay-as-you-go credits, MDLN token multipliers (up to 2×)
- **Contact form**: reach the team at `/connect`

### Platform
- **Pricing**: pay-as-you-go credits with MDLN multipliers
- **IP Protection**: compliance with the Berne Convention for the Protection of Literary and Artistic Works
- **Changelog**: release timeline at `/changelog`
- **Dark-theme UI**: glass navigation, gradient backgrounds, Framer Motion animations

---

## API Overview

The Medialane REST API indexes Starknet in real time and exposes structured data for any dApp or agent.

| Category | What you get |
|---|---|
| **Orders & Listings** | Open orders, bids, fulfilled listings. Filter by NFT, collection, user, currency, price. |
| **Tokens & Metadata** | On-chain + IPFS metadata for any token. Upload and pin your own metadata. |
| **Collections** | Floor price, total volume, holder count, token inventory for any collection. |
| **Activities** | Mints, transfers, sales, offers, cancellations, indexed in real time. |
| **Intents (SNIP-12)** | Create, sign, and submit structured trade intents using the SNIP-12 typed data standard. |
| **Search** | Full-text search across tokens, collections, and creators. |
| **Portal** | API keys, webhooks, usage, self-service from `/account`. |

Get your API key at [portal.medialane.io/account](https://portal.medialane.io/account). Full reference at [portal.medialane.io/docs/api](https://portal.medialane.io/docs/api).

---

## Getting Started (Local Development)

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Setup

```bash
# Clone
git clone https://github.com/medialane-io/medialane-portal.git
cd medialane-portal

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Fill in required values (see below)

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
bun dev          # Development server (localhost:3000)
bun run build    # Production build, must pass clean before deploy
bun lint         # ESLint
```

---

## SDK Quick Example

```bash
npm install @medialane/sdk starknet
```

```typescript
import { MedialaneClient } from "@medialane/sdk";

const client = new MedialaneClient({
  network: "mainnet",
  backendUrl: "https://medialane-backend-production.up.railway.app",
  apiKey: "ml_live_...", // from portal.medialane.io/account
});

// Query active listings
const orders = await client.api.getOrders({ status: "ACTIVE", sort: "recent" });

// Search tokens
const results = await client.api.search("digital art");

// Get token metadata with licensing attributes
const token = await client.api.getToken(contractAddress, tokenId);
console.log(token.data.metadata.licenseType);    // "CC BY-NC-SA"
console.log(token.data.metadata.commercialUse);  // "No"
console.log(token.data.metadata.attributes);     // IpAttribute[]
```

Full reference at [portal.medialane.io/docs/sdk](https://portal.medialane.io/docs/sdk) and on [npm](https://www.npmjs.com/package/@medialane/sdk).

---

## Contributing

Contributions are welcome. If you have a feature or improvement to suggest:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a Pull Request with the `enhancement` tag

---

## Related Repositories

| Repo | Description |
|---|---|
| [medialane-io](https://github.com/medialane-io/medialane-io) | Consumer app: Media Wallet, email login, sponsored transactions |
| [medialane-starknet](https://github.com/medialane-io/medialane-starknet) | Wallet-sovereign Starknet app: creator launchpad + NFT marketplace |
| [medialane-sdk](https://github.com/medialane-io/medialane-sdk) | TypeScript SDK (`@medialane/sdk`): `npm install @medialane/sdk` |

---

## License

[MIT](LICENSE)

Powered by **Starknet** · **Mediolano Protocol** · **@medialane/sdk**
