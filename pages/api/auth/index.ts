import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    const apiKey = process.env.SHOPIFY_API_KEY
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory'

    const state = Math.random().toString(36).substring(7)
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`

    res.redirect(authUrl)
}
