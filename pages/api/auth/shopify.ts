import { NextApiRequest, NextApiResponse } from 'next'
import { 
  verifyOAuthCallback, 
  getAccessToken, 
  saveShopData, 
  createSessionToken,
  installRequiredWebhooks 
} from '../../../lib/shopify-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, hmac, code, state, timestamp } = req.query

  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  const shopDomain = shop as string
  
  // 验证shop域名格式
  if (!shopDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
    return res.status(400).json({ error: 'Invalid shop domain' })
  }

  try {
    const apiKey = process.env.SHOPIFY_API_KEY
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders'
    const appUrl = process.env.SHOPIFY_APP_URL

    if (!apiKey || !appUrl) {
      console.error('Missing required environment variables:', { 
        hasApiKey: !!apiKey, 
        hasAppUrl: !!appUrl 
      })
      return res.status(500).json({ error: 'App configuration error' })
    }

    // 如果没有code参数，开始OAuth流程
    if (!code) {
      const redirectUri = `${appUrl}/api/auth/shopify`
      const nonce = Math.random().toString(36).substring(7)
      
      const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${apiKey}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${nonce}`

      return res.redirect(authUrl)
    }

    // OAuth回调处理
    console.log('Processing OAuth callback for shop:', shopDomain)

    // 1. 验证HMAC签名
    if (!verifyOAuthCallback(req.query)) {
      console.error('HMAC verification failed for shop:', shopDomain)
      return res.status(401).json({ error: 'Invalid HMAC signature' })
    }

    // 2. 用code换取access token
    const accessToken = await getAccessToken(shopDomain, code as string)
    if (!accessToken) {
      console.error('Failed to get access token for shop:', shopDomain)
      return res.status(500).json({ error: 'Failed to get access token' })
    }

    // 3. 保存店铺信息到数据库
    const saved = await saveShopData(shopDomain, accessToken)
    if (!saved) {
      console.error('Failed to save shop data for:', shopDomain)
      return res.status(500).json({ error: 'Failed to save shop data' })
    }

    // 4. 安装必需的webhooks
    const webhooksInstalled = await installRequiredWebhooks(shopDomain, accessToken)
    if (!webhooksInstalled) {
      console.warn('Failed to install some webhooks for:', shopDomain)
      // 不阻止安装流程，只记录警告
    }

    // 5. 创建会话令牌
    const sessionToken = createSessionToken(shopDomain)

    // 6. 设置会话cookie
    res.setHeader('Set-Cookie', [
      `shopify_session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`,
      `shop_domain=${shopDomain}; Secure; SameSite=None; Path=/; Max-Age=86400`
    ])

    // 7. 立即重定向到应用主界面
    console.log('Authentication successful, redirecting to app UI for:', shopDomain)
    return res.redirect(`/?shop=${shopDomain}&session=${sessionToken}`)

  } catch (error) {
    console.error('Shopify auth error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
