// Use configured gateway or fallback to dweb.link (more reliable for public reads than pinata)
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

/**
 * Resolves an IPFS URI to a HTTP URL using a public gateway.
 * Handles "ipfs://" prefix and direct CIDs.
 */
export function resolveIpfsUrl(uri: string): string {
    if (!uri) return ""

    // Check if it's already an HTTP URL
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri
    }

    // Remove "ipfs://" prefix if present
    const cleanUri = uri.replace("ipfs://", "")

    // Remove "ipfs/" path prefix if present (sometimes happens with double prefix)
    const cidPath = cleanUri.startsWith("ipfs/") ? cleanUri.replace("ipfs/", "") : cleanUri

    return `${IPFS_GATEWAY}${cidPath}`
}

/**
 * Fetches JSON metadata from an IPFS URI.
 * Uses a local API proxy to avoid CORS issues.
 * Returns null if fetching fails.
 */
export async function fetchIpfsJson<T = unknown>(uri: string): Promise<T | null> {
    if (!uri) return null

    try {
        const ipfsUrl = resolveIpfsUrl(uri)
        if (!ipfsUrl || !ipfsUrl.startsWith("http")) {
            console.warn(`[IPFS] Invalid resolved URL for URI: ${uri} -> ${ipfsUrl}`)
            return null
        }

        // Use local proxy to bypass CORS
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(ipfsUrl)}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

        try {
            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    "Accept": "application/json"
                }
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                console.warn(`[IPFS] Failed to fetch metadata from ${ipfsUrl} via proxy: ${response.status} ${response.statusText}`)
                return null
            }

            const data = await response.json()
            return data as T
        } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
                console.warn(`[IPFS] Fetch timeout for ${ipfsUrl}`)
            } else {
                console.error(`[IPFS] Fetch error for ${ipfsUrl} via proxy ${proxyUrl}:`, error instanceof Error ? error.message : error)
            }
            return null
        }
    } catch (error) {
        console.error(`[IPFS] Unexpected error fetching metadata from ${uri}:`, error)
        return null
    }
}

/**
 * Resolves a media URI (image, video, etc.) to a proxied HTTP URL.
 * Handles IPFS URIs, HTTP URLs, and CIDs.
 */
export function resolveMediaUrl(uri: string | undefined): string | undefined {
    if (!uri) return undefined

    // If it's a direct IPFS CID (starts with Qm... or bafy... and has no slashes)
    // or explicitly starts with ipfs://
    if (uri.startsWith("ipfs://") || (!uri.includes("/") && (uri.startsWith("Qm") || uri.startsWith("bafy")))) {
        return resolveIpfsUrl(uri)
    }

    // For HTTP(S) URLs, return as is. 
    // next/image will handle optimization if the hostname is whitelisted.
    if (uri.startsWith("http")) {
        return uri
    }

    return uri
}
