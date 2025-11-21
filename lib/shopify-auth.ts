import crypto from 'crypto'
import { supabaseAdmin } from './supabase'

// Shopify认证和验证工具函数

/**
 * 验证HMAC签名
 */
export function verifyHmac(data: string, hmac: string, secret: string): boolean {
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'hex'),
    Buffer.from(hmac, 'hex')
  )
}

/**
 * 验证Webhook HMAC签名
 * Per Shopify docs: Webhooks are signed with the App's Client Secret (SHOPIFY_API_SECRET)
 * Reference: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
 */
export function verifyWebhookHmac(body: string, signature: string): boolean {
  const apiSecret = process.env.SHOPIFY_API_SECRET
  if (!apiSecret) {
    console.error('SHOPIFY_API_SECRET not configured')
    return false
  }

  const calculatedHmac = crypto
    .createHmac('sha256', apiSecret)
    .update(body, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(signature, 'base64')
  )
}

/**
 * 验证OAuth回调参数
 */
export function verifyOAuthCallback(query: Record<string, any>): boolean {
  const { hmac, ...params } = query

  if (!hmac) return false

  // 构建查询字符串用于HMAC验证
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  const secret = process.env.SHOPIFY_API_SECRET
  if (!secret) {
    console.error('SHOPIFY_API_SECRET not configured')
    return false
  }

  return verifyHmac(sortedParams, hmac as string, secret)
}

/**
 * 获取访问令牌
 */
export async function getAccessToken(shop: string, code: string): Promise<string | null> {
  try {
    const apiKey = process.env.SHOPIFY_API_KEY
    const apiSecret = process.env.SHOPIFY_API_SECRET

    if (!apiKey || !apiSecret) {
      throw new Error('Missing Shopify API credentials')
    }

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

/**
 * 保存店铺信息到数据库
 */
export async function saveShopData(shop: string, accessToken: string): Promise<boolean> {
  try {
    // 获取店铺信息
    const shopInfo = await getShopInfo(shop, accessToken)

    const { error } = await supabaseAdmin
      .from('shops')
      .upsert({
        shop_domain: shop,
        access_token: accessToken,
        shop_name: shopInfo?.name || shop,
        email: shopInfo?.email,
        currency: shopInfo?.currency,
        timezone: shopInfo?.timezone,
        plan_name: shopInfo?.plan_name,
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error saving shop data:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in saveShopData:', error)
    return false
  }
}

/**
 * 获取店铺信息
 */
export async function getShopInfo(shop: string, accessToken: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get shop info: ${response.statusText}`)
    }

    const data = await response.json()
    return data.shop
  } catch (error) {
    console.error('Error getting shop info:', error)
    return null
  }
}

/**
 * 创建JWT会话令牌
 */
export function createSessionToken(shop: string): string {
  const jwt = require('jsonwebtoken')
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign(
    {
      shop,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    },
    secret
  )
}

/**
 * 验证会话令牌
 */
export function verifySessionToken(token: string): { shop: string } | null {
  try {
    const jwt = require('jsonwebtoken')
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    const decoded = jwt.verify(token, secret)
    return decoded as { shop: string }
  } catch (error) {
    console.error('Error verifying session token:', error)
    return null
  }
}

/**
 * 安装必需的webhooks
 */
export async function installRequiredWebhooks(shop: string, accessToken: string): Promise<boolean> {
  const webhooks = [
    {
      topic: 'app/uninstalled',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/app/uninstalled`,
      format: 'json'
    },
    {
      topic: 'customers/data_request',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/privacy/customers-data-request`,
      format: 'json'
    },
    {
      topic: 'customers/redact',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/privacy/customers-redact`,
      format: 'json'
    },
    {
      topic: 'shop/redact',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/privacy/shop-redact`,
      format: 'json'
    }
  ]

  try {
    for (const webhook of webhooks) {
      const response = await fetch(`https://${shop}/admin/api/2023-10/webhooks.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhook }),
      })

      if (!response.ok) {
        console.error(`Failed to create webhook ${webhook.topic}:`, response.statusText)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error installing webhooks:', error)
    return false
  }
}
