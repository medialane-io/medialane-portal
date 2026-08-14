
export interface IPFSUploadResponse {
  hash: string
  url: string
  gateway: string
}

export interface IPFSMetadata {
  name: string
  description: string
  image: string
  banner_image?: string
  external_url?: string
  seller_fee_basis_points?: number
  fee_recipient?: string
  attributes?: Array<{ trait_type: string; value: string }>
  category?: string
  type?: string
  visibility?: string
  tags?: string[]
  created_at?: string
}

const IPFS_GATEWAYS = {
  pinata: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  ipfs: 'https://ipfs.io/ipfs/',
  cloudflare: 'https://cloudflare-ipfs.com/ipfs/',
}

export class IPFSService {

  async uploadMetadata(metadata: IPFSMetadata, name?: string): Promise<IPFSUploadResponse> {
    try {
      const response = await fetch('/api/ipfs/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metadata, name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('IPFS metadata upload failed:', error)

      if (process.env.NODE_ENV === 'development') {
        console.warn('Using development fallback for IPFS upload')
        return this.developmentFallback(metadata)
      }

      throw error
    }
  }

  async uploadFile(file: File): Promise<IPFSUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ipfs/upload-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('IPFS file upload failed:', error)

      if (process.env.NODE_ENV === 'development') {
        console.warn('Using development fallback for IPFS file upload')
        const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`
        return {
          hash: mockHash,
          url: `ipfs://${mockHash}`,
          gateway: URL.createObjectURL(file)
        }
      }

      throw error
    }
  }

  async getFromIPFS(hash: string, gateway: keyof typeof IPFS_GATEWAYS = 'pinata'): Promise<unknown> {
    try {
      const url = `${IPFS_GATEWAYS[gateway]}${hash}`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.blob()
      }
    } catch (error) {
      console.error(`IPFS fetch failed for hash ${hash}:`, error)
      throw error
    }
  }

  private developmentFallback(metadata: IPFSMetadata): IPFSUploadResponse {
    const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`
    console.log('🔧 Development Mode: IPFS Upload Simulation')
    console.log('To enable real IPFS uploads, configure PINATA_JWT in your .env.local file')
    console.log('Simulated IPFS Upload:', {
      hash: mockHash,
      metadata
    })

    return {
      hash: mockHash,
      url: `ipfs://${mockHash}`,
      gateway: `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
    }
  }

  static ipfsToGateway(ipfsUrl: string, gateway: keyof typeof IPFS_GATEWAYS = 'pinata'): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '')
      return `${IPFS_GATEWAYS[gateway]}${hash}`
    }
    return ipfsUrl
  }

  static isValidIPFSHash(hash: string): boolean {

    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^b[A-Za-z2-7]{58}$/.test(hash)
  }
}

export const ipfsService = new IPFSService()