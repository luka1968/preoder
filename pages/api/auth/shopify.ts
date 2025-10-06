import { NextApiRequest, NextApiResponse } from 'next'

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
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.VERCEL_URL

    if (!apiKey || !appUrl) {
      console.error('Missing required environment variables:', { 
        hasApiKey: !!apiKey, 
        hasAppUrl: !!appUrl 
      })
      return res.status(500).json({ error: 'App configuration error' })
    }

    // 如果没有code参数，重定向到Shopify OAuth
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

    // 如果有code参数，处理OAuth回调
    // 这里应该验证HMAC并获取access token
    // 为了演示，我们先重定向到主应用
    
    console.log('OAuth callback received:', { shop: shopDomain, code: typeof code })
    
    // 在实际应用中，这里应该：
    // 1. 验证HMAC
    // 2. 用code换取access token
    // 3. 保存shop信息和token到数据库
    // 4. 创建JWT session
    
    // 暂时重定向到产品页面
    return res.redirect(`/products?shop=${shopDomain}`)

  } catch (error) {
    console.error('Shopify auth error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}
