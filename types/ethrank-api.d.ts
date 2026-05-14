import 'next'

declare module 'next' {
  interface NextApiRequest {
    /** Set by attachPaymentTier when x402 payment verification succeeds */
    x402Payer?: string
  }
}
