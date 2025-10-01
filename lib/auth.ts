import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { NextApiRequest } from 'next'

// JWT interfaces
export interface JWTPayload {
  shop: string
  shopId: string
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends NextApiRequest {
  shop?: string
  shopId?: string
  user?: JWTPayload
}

// JWT functions
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Token expires in 7 days
    issuer: 'preorder-pro',
    audience: 'shopify-app'
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'preorder-pro',
      audience: 'shopify-app'
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromRequest(req: NextApiRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie
  const cookieToken = req.cookies['preorder-auth-token']
  if (cookieToken) {
    return cookieToken
  }

  // Try query parameter (for webhooks)
  const queryToken = req.query.token
  if (typeof queryToken === 'string') {
    return queryToken
  }

  return null
}

// Authentication middleware
export function authenticateRequest(req: AuthenticatedRequest): boolean {
  const token = extractTokenFromRequest(req)
  if (!token) {
    return false
  }

  const payload = verifyJWT(token)
  if (!payload) {
    return false
  }

  // Attach user info to request
  req.shop = payload.shop
  req.shopId = payload.shopId
  req.user = payload

  return true
}

// Session management
export interface SessionData {
  shop: string
  shopId: string
  accessToken: string
  scope: string
  expiresAt?: number
}

export function createSession(data: SessionData): string {
  const sessionData = {
    ...data,
    createdAt: Date.now(),
    expiresAt: data.expiresAt || Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }

  // Encrypt session data
  const encrypted = encryptData(JSON.stringify(sessionData))
  return encrypted
}

export function validateSession(sessionToken: string): SessionData | null {
  try {
    const decrypted = decryptData(sessionToken)
    const sessionData = JSON.parse(decrypted) as SessionData & { createdAt: number, expiresAt: number }

    // Check if session is expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      return null
    }

    return {
      shop: sessionData.shop,
      shopId: sessionData.shopId,
      accessToken: sessionData.accessToken,
      scope: sessionData.scope
    }
  } catch (error) {
    console.error('Session validation failed:', error)
    return null
  }
}

// Encryption utilities
function encryptData(data: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  const key = crypto.scryptSync(secret, 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher('aes-256-cbc', key)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

function decryptData(encryptedData: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  const [ivHex, encrypted] = encryptedData.split(':')
  const key = crypto.scryptSync(secret, 'salt', 32)
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipher('aes-256-cbc', key)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// HMAC utilities for webhook verification
export function generateHMAC(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHMAC(data, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Rate limiting utilities
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(identifier, newEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

// Clean up expired rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// API key generation for external integrations
export function generateAPIKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashAPIKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

// Password utilities (for admin users if needed)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  } catch (error) {
    return false
  }
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
}

// CORS headers
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    process.env.SHOPIFY_APP_URL,
    'https://admin.shopify.com',
    'https://*.myshopify.com'
  ].filter(Boolean)

  const isAllowedOrigin = origin && allowedOrigins.some(allowed => {
    if (allowed?.includes('*')) {
      const pattern = allowed.replace('*', '.*')
      return new RegExp(pattern).test(origin)
    }
    return allowed === origin
  })

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  }
}

// Input validation utilities
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

export function validateShopDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/
  return shopRegex.test(shop) && shop.length <= 100
}

// Error handling utilities
export class AuthError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode: number = 401, code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class RateLimitError extends Error {
  public statusCode: number = 429
  public resetTime: number

  constructor(resetTime: number) {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
    this.resetTime = resetTime
  }
}

// Audit logging
export interface AuditLogEntry {
  userId?: string
  shop: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ip?: string
  userAgent?: string
  timestamp: string
}

export function createAuditLog(
  shop: string,
  action: string,
  resource: string,
  details?: Record<string, any>,
  req?: NextApiRequest
): AuditLogEntry {
  return {
    shop,
    action,
    resource,
    details,
    ip: req ? getClientIP(req) : undefined,
    userAgent: req?.headers['user-agent'],
    timestamp: new Date().toISOString()
  }
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress
  return ip || 'unknown'
}

// Token refresh utilities
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 60): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) {
      return true
    }

    const now = Math.floor(Date.now() / 1000)
    const threshold = thresholdMinutes * 60
    
    return (decoded.exp - now) < threshold
  } catch {
    return true
  }
}

export function refreshToken(oldToken: string): string | null {
  const payload = verifyJWT(oldToken)
  if (!payload) {
    return null
  }

  // Generate new token with same payload but fresh expiration
  return generateJWT({
    shop: payload.shop,
    shopId: payload.shopId
  })
}
