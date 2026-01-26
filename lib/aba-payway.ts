import crypto from 'crypto'

export interface ABAPaywayConfig {
  merchantId: string
  apiKey: string
  baseUrl: string
  isProduction?: boolean
}

export interface PaymentRequest {
  tran_id: string
  amount: number
  firstname: string
  lastname: string
  email: string
  phone: string
  payment_description: string
  return_url: string
  continue_success_url?: string
}

export class ABAPayway {
  private config: ABAPaywayConfig

  constructor(config: ABAPaywayConfig) {
    this.config = config
  }

  /**
   * Generate a unique transaction ID
   */
  generateTransactionId(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `BAD${timestamp}${random}`
  }

  /**
   * Generate SHA-512 hash for ABA Payway
   */
  private generateHash(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort()
    const hashString = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
    return crypto.createHash('sha512').update(hashString).digest('hex')
  }

  /**
   * Create payment request with all required parameters
   */
  createPaymentRequest(request: PaymentRequest) {
    const baseUrl = this.config.isProduction 
      ? 'https://checkout.payway.com.kh' 
      : 'https://checkout-sandbox.payway.com.kh'

    const params = {
      req_time: Date.now().toString(),
      merchant_id: this.config.merchantId,
      tran_id: request.tran_id,
      amount: request.amount.toString(),
      firstname: request.firstname,
      lastname: request.lastname,
      email: request.email,
      phone: request.phone,
      payment_description: request.payment_description,
      return_url: request.return_url,
      continue_success_url: request.continue_success_url || request.return_url,
      type: 'purchase',
      currency: 'USD',
    }

    // Generate hash
    const hash = this.generateHash({
      ...params,
      api_key: this.config.apiKey
    })

    return {
      paymentUrl: `${baseUrl}/payment?${new URLSearchParams({
        ...params,
        hash
      }).toString()}`,
      tranId: request.tran_id,
      params
    }
  }

  /**
   * Verify payment response
   */
  verifyPaymentResponse(responseParams: Record<string, string>): boolean {
    const { hash, ...params } = responseParams
    
    if (!hash) return false

    const expectedHash = this.generateHash({
      ...params,
      api_key: this.config.apiKey
    })

    return hash === expectedHash
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(tranId: string) {
    const params = {
      req_time: Date.now().toString(),
      merchant_id: this.config.merchantId,
      tran_id: tranId,
    }

    const hash = this.generateHash({
      ...params,
      api_key: this.config.apiKey
    })

    try {
      const response = await fetch(`${this.config.baseUrl}/api/check-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          hash
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error checking transaction status:', error)
      throw error
    }
  }
}

// Default instance configured with environment variables
export const abaPayway = new ABAPayway({
  merchantId: process.env.ABA_MERCHANT_ID || '',
  apiKey: process.env.ABA_API_KEY || '',
  baseUrl: process.env.ABA_BASE_URL || 'https://checkout-sandbox.payway.com.kh/api',
  isProduction: process.env.NODE_ENV === 'production'
})

// Export default config for easy testing
export const createABAPaywayInstance = (config: ABAPaywayConfig) => {
  return new ABAPayway(config)
}