import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, shop } = req.query

    if (!code || !shop) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    try {
        const apiKey = process.env.SHOPIFY_API_KEY
        const apiSecret = process.env.SHOPIFY_API_SECRET

        const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
        })

        const data = await response.json()
        const accessToken = data.access_token

        await supabaseAdmin.from('shops').upsert({
            shop_domain: shop,
            access_token: accessToken,
            installed_at: new Date().toISOString(),
        }, { onConflict: 'shop_domain' })

        res.redirect(`/admin?shop=${shop}`)
    } catch (error) {
        console.error('OAuth error:', error)
        res.status(500).json({ error: 'Installation failed' })
    }
}
