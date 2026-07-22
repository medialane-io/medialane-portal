// IPFS Service for uploading metadata and media files
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

// IPFS Gateway configurations
const IPFS_GATEWAYS = {
  pinata: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  ipfs: 'https://ipfs.io/ipfs/',
  cloudflare: 'https://cloudflare-ipfs.com/ipfs/',
}

export class IPFSService {
  
  /**
   * Upload JSON metadata to IPFS using server-side API
   */
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
      
      // Fallback to local storage simulation for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using development fallback for IPFS upload')
        return this.developmentFallback(metadata)
      }
      
      throw error
    }
  }

  /**
   * Upload file to IPFS using server-side API
   */
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
      
      // Fallback for development
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

  /**
   * Get IPFS content from hash using gateway
   */
  async getFromIPFS(hash: string, gateway: keyof typeof IPFS_GATEWAYS = 'pinata'): Promise<unknown> {
    try {
      const url = `${IPFS_GATEWAYS[gateway]}${hash}`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
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

  /**
   * Development fallback when IPFS is not configured
   */
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

  /**
   * Convert IPFS URL to gateway URL
   */
  static ipfsToGateway(ipfsUrl: string, gateway: keyof typeof IPFS_GATEWAYS = 'pinata'): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '')
      return `${IPFS_GATEWAYS[gateway]}${hash}`
    }
    return ipfsUrl
  }

  /**
   * Validate IPFS hash format
   */
  static isValidIPFSHash(hash: string): boolean {
    // Basic validation for IPFS v1 CID (starts with 'Qm' and is 46 chars) or v2 CID
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^b[A-Za-z2-7]{58}$/.test(hash)
  }
}

// Export singleton instance
export const ipfsService = new IPFSService() 