

export interface RateLimiterConfig {
    maxRequestsPerSecond: number
    maxRetries: number
    initialBackoffMs: number
    maxBackoffMs: number
    cacheTimeoutMs: number
}

export interface CachedResponse<T> {
    data: T
    timestamp: number
    expiresAt: number
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    return String(error)
}

export class RateLimiterService {
    private config: RateLimiterConfig
    private requestQueue: Array<() => Promise<void>> = []
    private isProcessing: boolean = false
    private lastRequestTime: number = 0
    private cache: Map<string, CachedResponse<unknown>> = new Map()
    private requestsInProgress: Map<string, Promise<unknown>> = new Map()

    constructor(config: Partial<RateLimiterConfig> = {}) {
        this.config = {
            maxRequestsPerSecond: 3,
            maxRetries: 2,
            initialBackoffMs: 1000,
            maxBackoffMs: 30000,
            cacheTimeoutMs: 60000,
            ...config
        }
    }

    public async executeWithRateLimit<T>(
        fn: () => Promise<T>,
        cacheKey?: string,
        cacheTimeout?: number
    ): Promise<T> {

        if (cacheKey && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!
            if (cached.expiresAt > Date.now()) {
                console.debug(`Cache hit for ${cacheKey}`)
                return cached.data as T
            } else {
                this.cache.delete(cacheKey)
            }
        }

        if (cacheKey && this.requestsInProgress.has(cacheKey)) {
            return await (this.requestsInProgress.get(cacheKey)! as Promise<T>)
        }

        const executeWithRetry = async (attempt: number = 0): Promise<T> => {
            try {
                await this.waitForRateLimit()
                const result = await fn()

                if (cacheKey) {
                    const timeout = cacheTimeout || this.config.cacheTimeoutMs
                    this.cache.set(cacheKey, {
                        data: result,
                        timestamp: Date.now(),
                        expiresAt: Date.now() + timeout
                    })
                }

                return result
            } catch (error: unknown) {
                if (attempt < this.config.maxRetries && this.shouldRetry(error)) {
                    const backoffMs = Math.min(
                        this.config.initialBackoffMs * Math.pow(2, attempt),
                        this.config.maxBackoffMs
                    )

                    console.warn(
                        `Request failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}), retrying in ${backoffMs}ms:`,
                        getErrorMessage(error)
                    )

                    await this.delay(backoffMs)
                    return executeWithRetry(attempt + 1)
                } else {

                    const errorMessage = getErrorMessage(error)
                    const isContractError = errorMessage.includes('Contract error') ||
                                          errorMessage.includes('ERC721: invalid token ID') ||
                                          errorMessage.includes('invalid token ID')

                    if (!isContractError) {
                        console.error('Request failed after retries:', errorMessage)
                    }
                }
                throw error
            }
        }

        if (cacheKey) {
            const promise = executeWithRetry()
            this.requestsInProgress.set(cacheKey, promise as Promise<unknown>)

            try {
                const result = await promise
                return result
            } finally {
                this.requestsInProgress.delete(cacheKey)
            }
        }

        return executeWithRetry()
    }

    public async executeBatch<T>(
        functions: Array<() => Promise<T>>,
        batchSize: number = 3
    ): Promise<T[]> {
        const results: T[] = []

        for (let i = 0; i < functions.length; i += batchSize) {
            const batch = functions.slice(i, i + batchSize)
            const batchPromises = batch.map(fn => this.executeWithRateLimit(fn))
            const batchResults = await Promise.all(batchPromises)
            results.push(...batchResults)

            if (i + batchSize < functions.length) {
                await this.delay(500)
            }
        }

        return results
    }

    private async waitForRateLimit(): Promise<void> {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime
        const minInterval = 1000 / this.config.maxRequestsPerSecond

        if (timeSinceLastRequest < minInterval) {
            const waitTime = minInterval - timeSinceLastRequest
            await this.delay(waitTime)
        }

        this.lastRequestTime = Date.now()
    }

    private shouldRetry(error: unknown): boolean {
        if (!error) return false

        const errorMessage = getErrorMessage(error)

        console.debug('shouldRetry check:', {
            errorMessage: errorMessage.substring(0, 200),
            maxRetries: this.config.maxRetries
        })

        const contractErrors = [
            'ERC721: invalid token ID',
            'invalid token ID',
            'Token does not exist',
            'Collection does not exist',
            'Execution failed',
            'revert_error',
            'unauthorized',
            'insufficient balance',
            'not approved',
            'already exists',
            'invalid address',
            'invalid parameter',
            'invalid collection',
            'token does not exist',
            'collection not found'
        ]

        const shouldNotRetry = contractErrors.some(err => errorMessage.toLowerCase().includes(err.toLowerCase()))
        if (shouldNotRetry) {
            console.debug('Not retrying contract error:', errorMessage.substring(0, 100))
            return false
        }

        if (errorMessage.includes('Contract error') &&
            !errorMessage.includes('Rate limit') &&
            !errorMessage.includes('429') &&
            !errorMessage.includes('Too Many Requests')) {
            console.debug('Not retrying generic contract error')
            return false
        }

        if (errorMessage.includes('0x4552433732313a20696e76616c696420746f6b656e204944')) {
            console.debug('Not retrying hex-encoded ERC721 invalid token ID error')
            return false
        }

        if (errorMessage.includes('429') ||
            errorMessage.includes('Too Many Requests') ||
            errorMessage.includes('Rate limit')) {
            return true
        }

        if (errorMessage.includes('network') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('fetch')) {
            return true
        }

        if ((errorMessage.includes('500') ||
            errorMessage.includes('502') ||
            errorMessage.includes('503') ||
            errorMessage.includes('504')) &&
            !errorMessage.includes('Contract error')) {
            return true
        }

        return false
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    public clearCache(): void {
        this.cache.clear()
        this.requestsInProgress.clear()
    }

    public getCacheStats(): {
        size: number
        hitRate: number
        requestsInProgress: number
    } {
        const now = Date.now()
        let validEntries = 0

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt > now) {
                validEntries++
            } else {
                this.cache.delete(key)
            }
        }

        return {
            size: validEntries,
            hitRate: 0,
            requestsInProgress: this.requestsInProgress.size
        }
    }

    public updateConfig(newConfig: Partial<RateLimiterConfig>): void {
        this.config = { ...this.config, ...newConfig }
    }
}

export const rateLimiter = new RateLimiterService({
    maxRequestsPerSecond: 3,
    maxRetries: 2,
    initialBackoffMs: 1000,
    maxBackoffMs: 30000,
    cacheTimeoutMs: 60000
})

rateLimiter.clearCache()