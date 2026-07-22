export async function uploadToIPFS(file: File): Promise<string> {
    // TODO: Implement actual IPFS upload (e.g., Pinata, NFT.storage, or backend proxy)
    console.warn("Using mock IPFS upload. Please implement actual storage logic.")

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return a mock CID based on file name to be somewhat deterministic for testing
    // In production, this would be the IPFS hash from the upload service
    return `ipfs://QmMock${btoa(file.name).substring(0, 10)}`
}

export async function uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    // TODO: Implement metadata upload
    console.warn("Using mock Metadata upload.", metadata)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return `ipfs://QmMockMetadata${Date.now()}`
}
