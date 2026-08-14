export async function uploadToIPFS(file: File): Promise<string> {

    console.warn("Using mock IPFS upload. Please implement actual storage logic.")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    return `ipfs://QmMock${btoa(file.name).substring(0, 10)}`
}

export async function uploadMetadata(metadata: Record<string, unknown>): Promise<string> {

    console.warn("Using mock Metadata upload.", metadata)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return `ipfs://QmMockMetadata${Date.now()}`
}
