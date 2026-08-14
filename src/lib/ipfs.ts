
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

export function resolveIpfsUrl(uri: string): string {
    if (!uri) return ""

    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri
    }

    const cleanUri = uri.replace("ipfs://", "")

    const cidPath = cleanUri.startsWith("ipfs/") ? cleanUri.replace("ipfs/", "") : cleanUri

    return `${IPFS_GATEWAY}${cidPath}`
}

export async function fetchIpfsJson<T = unknown>(uri: string): Promise<T | null> {
    if (!uri) return null

    try {
        const ipfsUrl = resolveIpfsUrl(uri)
        if (!ipfsUrl || !ipfsUrl.startsWith("http")) {
            console.warn(`[IPFS] Invalid resolved URL for URI: ${uri} -> ${ipfsUrl}`)
            return null
        }

        const proxyUrl = `/api/proxy?url=${encodeURIComponent(ipfsUrl)}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

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

export function resolveMediaUrl(uri: string | undefined): string | undefined {
    if (!uri) return undefined

    if (uri.startsWith("ipfs://") || (!uri.includes("/") && (uri.startsWith("Qm") || uri.startsWith("bafy")))) {
        return resolveIpfsUrl(uri)
    }

    if (uri.startsWith("http")) {
        return uri
    }

    return uri
}
