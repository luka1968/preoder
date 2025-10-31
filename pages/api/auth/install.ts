import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop } = req.query

    if (!shop) {
      return res.status(400).json({ error: '请提供店铺域名' })
    }

    const shopDomain = (shop as string).replace(/^https?:\/\//, '').replace(/\/$/, '')

    // 验证店铺域名格式
    if (!shopDomain.endsWith('.myshopify.com')) {
      return res.status(400).json({ error: '无效的店铺域名' })
    }

    const apiKey = process.env.SHOPIFY_API_KEY
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders'
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL
    const redirectUri = `${appUrl}/api/auth/callback`

    // 生成随机 state
    const state = Math.random().toString(36).substring(7)

    // 构建 OAuth URL
    const installUrl = `https://${shopDomain}/admin/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`

    console.log('🔗 生成安装URL:', installUrl)

    // 重定向到 Shopify OAuth
    return res.redirect(installUrl)

  } catch (error: any) {
    console.error('❌ 生成安装URL错误:', error)
    return res.status(500).json({ error: '生成安装链接失败' })
  }
}
