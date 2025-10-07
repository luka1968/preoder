import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

export interface ShopifySessionPayload {
  iss: string
  dest: string
  aud: string
  sub: string
  exp: number
  nbf: number
  iat: number
  jti: string
  sid: string
}

/**
 * 验证Shopify Session Token (JWT)
 */
export function verifySessionToken(token: string): ShopifySessionPayload | null {
  try {
    const secret = process.env.SHOPIFY_API_SECRET
    if (!secret) {
      console.error('SHOPIFY_API_SECRET not configured')
      return null
    }

    // 验证JWT token
    const payload = jwt.verify(token, secret) as ShopifySessionPayload
    
    // 验证基本字段
    if (!payload.dest || !payload.aud || !payload.sub) {
      console.error('Invalid session token payload')
      return null
    }

    return payload
  } catch (error) {
    console.error('Session token verification failed:', error)
    return null
  }
}

/**
 * Session Token认证中间件
 */
export function requireSessionToken(
  handler: (req: NextApiRequest, res: NextApiResponse, session: ShopifySessionPayload) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 从Authorization header获取token
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' })
      }

      const token = authHeader.replace('Bearer ', '')
      const session = verifySessionToken(token)

      if (!session) {
        return res.status(401).json({ error: 'Invalid session token' })
      }

      // 从dest字段提取shop域名
      const shop = session.dest.replace('https://', '').replace('/admin', '')
      
      // 添加shop信息到request
      ;(req as any).shop = shop
      ;(req as any).session = session

      // 调用原始handler
      await handler(req, res, session)

    } catch (error) {
      console.error('Session token middleware error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * 从请求中提取shop域名
 */
export function getShopFromRequest(req: NextApiRequest): string | null {
  // 优先从session token获取
  if ((req as any).shop) {
    return (req as any).shop
  }

  // 从query参数获取
  if (req.query.shop && typeof req.query.shop === 'string') {
    return req.query.shop
  }

  // 从headers获取
  const shopHeader = req.headers['x-shopify-shop-domain']
  if (shopHeader && typeof shopHeader === 'string') {
    return shopHeader
  }

  return null
}
