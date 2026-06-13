/**
 * Canonical Medialane service ids — mirrors the SDK service registry
 * (@medialane/sdk `listServices()`). Used by the admin claim-approval and
 * collection-classification UIs so every supported type is selectable.
 *
 * Coins (`external-erc20`, `creator-coin`) drive the coin view on the dapp
 * (`uiVariant === "coin"`). They were previously missing from the admin
 * dropdowns, which made it impossible to classify a claimed memecoin as a coin.
 * Listed first since external memecoins are the most common admin claim.
 *
 * Keep in sync with the SDK registry when services are added.
 */
export const SERVICE_IDS = [
  "external-erc20",   // external memecoin / coin → coin view
  "creator-coin",     // coin launched on Medialane → coin view
  "external-erc721",  // external NFT collection
  "external-erc1155", // external multi-edition collection
  "mip-erc721",       // Medialane IP collection
  "ip-erc721",        // Programmable IP (genesis)
  "mip-erc1155",      // NFT Editions
  "pop-protocol",     // POP Protocol
  "drop-collection",  // Collection Drop
] as const;
