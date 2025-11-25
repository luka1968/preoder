import { NextApiRequest, NextApiResponse } from 'next'

/**
 * GET /auth?shop=xxx.myshopify.com
 * 
 * Shopify OAuth 授权入口
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    const apiKey = process.env.SHOPIFY_API_KEY
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/auth/callback`
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers,write_customers,write_draft_orders,read_draft_orders'

    // 生成随机 state
    const state = Math.random().toString(36).substring(7)

    // 构建 Shopify OAuth URL
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`

    // 重定向到 Shopify 授权页面
    res.redirect(authUrl)
}
