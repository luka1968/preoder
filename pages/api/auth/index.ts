import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    // 验证 shop 域名格式
    if (typeof shop !== 'string' || !shop.endsWith('.myshopify.com')) {
        return res.status(400).json({ error: 'Invalid shop domain' })
    }

    const apiKey = process.env.SHOPIFY_API_KEY
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory'

    // ✅ 生成加密安全的随机 state（32字节）
    const state = crypto.randomBytes(32).toString('hex')

    // ✅ 保存 state 和 shop 到 HttpOnly Cookie（10分钟过期）
    res.setHeader('Set-Cookie', [
        `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        `oauth_shop=${shop}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    ])

    console.log(`🔐 OAuth initiated for shop: ${shop}, state: ${state.substring(0, 8)}...`)

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`

    res.redirect(authUrl)
}
