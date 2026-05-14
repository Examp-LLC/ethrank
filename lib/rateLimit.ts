import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import type { Request } from 'express'
import type { NextApiRequest } from 'next'

const getIP = (request: {
  ip?: string
  headers: { [x: string]: unknown }
  connection?: { remoteAddress?: unknown }
}) =>
  request.ip ||
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.connection?.remoteAddress

/**
 * Rate limit bucket: verified x402 payers are keyed by payer id; everyone else by IP.
 */
export function getRateLimitKey(req: NextApiRequest): string {
  if (req.x402Payer) return `x402:${req.x402Payer}`
  return String(getIP(req))
}

export const getRateLimitMiddlewares = ({
  limit = 10,
  paidLimit = 200,
  windowMs = 60 * 1000,
  delayAfter = Math.round(10 / 2),
  delayMs = 500,
} = {}) => [
  slowDown({
    keyGenerator: (req: Request) => getRateLimitKey(req as unknown as NextApiRequest),
    windowMs,
    delayAfter,
    delayMs,
    skip: (req: Request) => Boolean((req as unknown as NextApiRequest).x402Payer),
  }),
  rateLimit({
    keyGenerator: (req: Request) => getRateLimitKey(req as unknown as NextApiRequest),
    windowMs,
    max: (req: Request) => ((req as unknown as NextApiRequest).x402Payer ? paidLimit : limit),
  }),
]
